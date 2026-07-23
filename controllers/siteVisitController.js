// controllers/siteVisitController.js
const { logData } = require('../helpers/logger');

const { SiteVisit } = require("../models");

const UAParser = require("ua-parser-js");


/**
 * Extract the original visitor IP.
 *
 * x-forwarded-for can contain:
 * client-ip, proxy-1-ip, proxy-2-ip
 */
function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  let ipAddress;

  if (forwardedFor) {
    ipAddress = forwardedFor.split(",")[0].trim();
  } else {
    ipAddress =
      req.ip ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      null;
  }

  if (!ipAddress) {
    return null;
  }

  // Convert IPv4-mapped IPv6:
  // ::ffff:192.168.1.10 -> 192.168.1.10
  if (ipAddress.startsWith("::ffff:")) {
    ipAddress = ipAddress.substring(7);
  }

  // Remove brackets from IPv6 values when present.
  if (ipAddress.startsWith("[") && ipAddress.endsWith("]")) {
    ipAddress = ipAddress.slice(1, -1);
  }

  return ipAddress;
}

/**
 * Determine whether an IP is local, private or reserved.
 * Public geolocation services cannot locate these addresses.
 */
function isPrivateIp(ipAddress) {
  if (!ipAddress) {
    return true;
  }

  const ip = ipAddress.toLowerCase();

  if (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip === "localhost" ||
    ip === "0.0.0.0"
  ) {
    return true;
  }

  // IPv4 private/reserved ranges.
  if (
    /^10\./.test(ip) ||
    /^127\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^169\.254\./.test(ip)
  ) {
    return true;
  }

  // 172.16.0.0 - 172.31.255.255
  const private172Match = ip.match(/^172\.(\d{1,3})\./);

  if (private172Match) {
    const secondPart = Number(private172Match[1]);

    if (secondPart >= 16 && secondPart <= 31) {
      return true;
    }
  }

  // Common IPv6 private/link-local ranges.
  if (
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80:")
  ) {
    return true;
  }

  return false;
}

/**
 * Retrieve geographic and network information for a public IP.
 *
 * Returns null when:
 * - IP is private/local
 * - API request fails
 * - API quota is exceeded
 * - API returns success=false
 */
async function getIpLocation(ipAddress) {
  if (!ipAddress || isPrivateIp(ipAddress)) {
    return null;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000);

  try {
    const fields = [
      "success",
      "message",
      "country",
      "country_code",
      "region",
      "city",
      "latitude",
      "longitude",
      "timezone.id",
      "connection.isp",
      "connection.org",
      "connection.asn",
    ].join(",");

    const url =
      `https://ipwho.is/${encodeURIComponent(ipAddress)}` +
      `?fields=${encodeURIComponent(fields)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `IP geolocation request failed with HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (data.success === false) {
      throw new Error(
        data.message || "IP geolocation service returned an error"
      );
    }

    return data;
  } catch (error) {
    logData(`getIpLocation: ${error.message}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse browser, operating system and device information.
 */
function getDeviceInformation(userAgent) {
  const parser = new UAParser(userAgent || "");
  const result = parser.getResult();

  const browserName = result.browser?.name || "Unknown";
  const browserVersion = result.browser?.version || null;

  const operatingSystem = result.os?.name || "Unknown";
  const osVersion = result.os?.version || null;

  /*
   * UAParser normally returns undefined for ordinary desktop devices.
   * In that situation we classify the device as desktop.
   */
  const parsedDeviceType = result.device?.type;
  const deviceType = parsedDeviceType || "desktop";

  const normalizedDeviceType = deviceType.toLowerCase();

  const isMobile = normalizedDeviceType === "mobile";
  const isTablet = normalizedDeviceType === "tablet";
  const isDesktop = !isMobile && !isTablet;

  return {
    browser: browserName,
    browser_version: browserVersion,
    operating_system: operatingSystem,
    os_version: osVersion,
    device_type: deviceType,
    device_vendor: result.device?.vendor || null,
    device_model: result.device?.model || null,
    is_mobile: isMobile,
    is_tablet: isTablet,
    is_desktop: isDesktop,
  };
}

/**
 * POST /api/site-visits
 */
exports.createVisit = async (req, res) => {
  try {
    const pageUrl =
      typeof req.body?.page_url === "string"
        ? req.body.page_url.trim()
        : "";

    if (!pageUrl) {
      return res.status(400).json({
        message: "page_url is required",
      });
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.get("user-agent") || null;

    const deviceInformation = getDeviceInformation(userAgent);
    const ipLocation = await getIpLocation(ipAddress);

    const visit = await SiteVisit.create({
      page_url: pageUrl,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer:
        req.get("referer") ||
        req.get("referrer") ||
        null,

      country: ipLocation?.country || null,
      country_code: ipLocation?.country_code || null,
      region: ipLocation?.region || null,
      city: ipLocation?.city || null,
      latitude: ipLocation?.latitude ?? null,
      longitude: ipLocation?.longitude ?? null,
      timezone: ipLocation?.timezone?.id || null,
      isp: ipLocation?.connection?.isp || null,
      organization: ipLocation?.connection?.org || null,
      asn: ipLocation?.connection?.asn ?? null,

      browser: deviceInformation.browser,
      browser_version: deviceInformation.browser_version,
      operating_system: deviceInformation.operating_system,
      os_version: deviceInformation.os_version,
      device_type: deviceInformation.device_type,
      device_vendor: deviceInformation.device_vendor,
      device_model: deviceInformation.device_model,
      is_mobile: deviceInformation.is_mobile,
      is_tablet: deviceInformation.is_tablet,
      is_desktop: deviceInformation.is_desktop,
    });

    return res.status(201).json(visit);
  } catch (error) {
    logData(`createVisit: ${error.stack || error.message}`);

    return res.status(500).json({
      message: "Failed to record site visit",
    });
  }
};

exports.getVisits = async (req, res) => {
  try {
    const visits = await SiteVisit.findAll({
      order: [["visited_at", "DESC"]],
    });

    res.json(visits);
  } catch (error) {
     logData('getVisits: ' + error)
    res.status(500).json({ message: error.message });
  }
};

exports.getVisitById = async (req, res) => {
  try {
    const visit = await SiteVisit.findByPk(req.params.id);

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.json(visit);
  } catch (error) {
     logData('getVisitById: ' + error)
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVisit = async (req, res) => {
  try {
    const deleted = await SiteVisit.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.json({ message: "Visit deleted successfully" });
  } catch (error) {
    logData('deleteVisit: ' + error)
    res.status(500).json({ message: error.message });
  }
};

exports.getVisitCount = async (req, res) => {
  try {
    const total = await SiteVisit.count();

    res.json({ total_visits: total });
  } catch (error) {
        logData('getVisitCount: ' + error)
    res.status(500).json({ message: error.message });
  }
};
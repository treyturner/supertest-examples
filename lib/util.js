/**
 * Throws an error if the 'content-type' header of the response does not
 * match our expectations for JSON, which in the case of restful-booker includes
 * specification of the UTF-8 character set
 * @param {Object} res The Superagent response object
 */
exports.isJson = function (res) {
  if (res.headers['content-type'] !== 'application/json; charset=utf-8')
    throw new Error(`Response is not JSON. content-type: ${res.headers['content-type']}`)
}

/**
 * Throws an error if the 'content-type' header of the response does not
 * match our expectations for XML, which in the case of restful-booker includes
 * specification of the UTF-8 character set
 * @param {Object} res The Superagent response object
 */
exports.isXml = function (res) {
  if (res.headers['content-type'] !== 'text/html; charset=utf-8')
    throw new Error(`Response is not XML. content-type: ${res.headers['content-type']}`)
}

/**
 * Throws an error if the response body is not an Array
 * @param {Object} res The Superagent response object
 */
exports.isArray = function (res) {
  if (!Array.isArray(res.body)) throw new Error(`Response body is not an Array`)
}

const ResponseFormat = (status, message, data) => {
    return {
        status,
        message,
        data
    }
}
module.exports = ResponseFormat;
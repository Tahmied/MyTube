class apiResponse {
    constructor(statusCode, data, message = "Success") {
        his.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { apiResponse }
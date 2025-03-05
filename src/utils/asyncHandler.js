const asyncHandler = (asynchFunction) => {
    (req, res, next) => {
        Promise.resolve(asynchFunction(req, res, next)).catch((err) => { next(err) })
    }
}

export { asyncHandler }
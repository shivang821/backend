const sendToken = (user, res, message) => {
    const token = user.getJwtToken();
    const options = { httpOnly: true, maxAge: 5 * 60 * 1000 };
    res.status(200).cookie("token", token, options).json({ success: true, user, token, message })
}
module.exports = sendToken
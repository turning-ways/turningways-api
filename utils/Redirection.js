const cookieSender = (
  res,
  redirectLink,
  refreshToken,
  accessToken,
  disabled,
) => {
  const CookieOptions = {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  };

  if (disabled) {
    return res.status(200).json({
      status: "success",
      redirect: redirectLink,
      accessToken: accessToken,
    });
  }

  return res
    .cookie("refreshToken", refreshToken, CookieOptions)
    .status(200)
    .json({
      status: "success",
      redirect: redirectLink,
      accessToken: accessToken,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mainChurch: user.mainChurch,
      },
    });
};

function handleLogin(accessToken, refreshToken, user, res) {
  const { role, mainChurch } = user;

  // Check if user is admin
  if (role === "admin") {
    // Determine the redirect link based on whether the admin has a main church
    const redirectLink = mainChurch ? "admin dashboard" : "church selection";
    const disabled = false;
    cookieSender(res, redirectLink, refreshToken, accessToken, disabled, user);
  } else {
    // Send a not an admin response error
    return res.status(401).json({
      status: "error",
      message: "Access denied: You do not have admin privileges.",
    });
  }
}

exports.handleLogin = handleLogin;

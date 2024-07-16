function emailVerification(OTP) {
  return `<table cellspacing="0" cellpadding="0" style="background-color: #1A2025; border: 1px solid #333; width: 100%;">
  <tbody>
      <tr>
          <td>
              <div
                  style="background-color: #1A2025; border: 1px solid #333; border-radius: 10px; box-sizing: border-box; font-family: Lato, Helvetica, 'Helvetica Neue', Arial, 'sans-serif'; margin: auto; max-width: 600px; overflow: hidden; width: 600px;">
                  <div
                      style="background-color: azure; padding: 40px; text-align: center; background-repeat: no-repeat; background-position: calc( 100% - 20px ) 20px; background-size: 50px;">
                      <h2 style="color: rgb(255, 255, 255); font-size: 24px; font-weight: normal; margin: 0px; text-align: left;"
                          class="align-left">
                          <img src="https://i.ibb.co/QrPtKdb/TW-black-white-1.png" alt="TW-black-white-1"
                              border="0" width="170" height="29"><br>
                      </h2>
                  </div>
                  <div
                      style="padding: 40px 50px; background-color: #1A2025; background-repeat: no-repeat; background-position: top; background-size: contain;">
                      <div><b><span class="size" style="font-size: 24px; color: #fff;">Please Verify
                                  Email</span></b><br></div>
                      <div><b><span class="size" style="font-size: 24px; color: #fff;"></span></b><br></div>
                      <div>
                          <span style="color: #fff; font-family: Helvetica, sans-serif; font-size: 14px;">Please
                              verify your email so that we can confirm it’s really you who signed up for our list.
                              Use
                              the code below to verify your email.</span><br>
                      </div>
                      <div style="text-align: center; margin-top: 15px">
                          <div
                              style="background-color: #25586B; border-radius: 6px; color: #fff; display: inline-block; font-size: 30px; padding: 20px 30px;">
                              ${OTP}</div><br>
                      </div>
                      <div style="display: flex; align-items: center; justify-content: center; margin-top: 15px;">
                          <div
                              style="background-image: url(../images/sampleTemplates/copy.svg); background-repeat: no-repeat; background-size: contain; height: 14px; width: 14px;">
                              <br>
                          </div>
                      </div>
                      <p style="margin: 35px 0px; line-height: 22px;">
                          <span class="size"
                              style="font-size: 14px; margin: 35px 0px; line-height: 22px; color: #fff;">If you
                              didn't
                              request this one-time password, ignore the email.</span><br>
                      </p>
                      <p style="margin: 0px; line-height: 22px;">
                          <span class="size"
                              style="font-size: 14px; margin: 0px; line-height: 22px; color: #fff;">Thank
                              you,</span><br>
                      </p>
                      <p style="margin: 0px; line-height: 22px;">
                          <span class="size"
                              style="font-size: 14px; margin: 0px; line-height: 22px; color: #fff;">TeamTurningWays</span><br>
                      </p>
                  </div>
              </div>
          </td>
      </tr>
  </tbody>
</table>
<div><br></div>
<div><br></div>
`;
}

function forgotPasswordEmail(OTP) {
  return `<table cellspacing="0" cellpadding="0" style="background-color: #1A2025; border: 1px solid #333; width: 100%;">
    <tbody>
        <tr>
            <td>
                <div
                    style="background-color: #1A2025; border: 1px solid #333; border-radius: 10px; box-sizing: border-box; font-family: Lato, Helvetica, 'Helvetica Neue', Arial, 'sans-serif'; margin: auto; max-width: 600px; overflow: hidden; width: 600px;">
                    <div
                        style="background-color: #azure; padding: 40px; text-align: center; background-repeat: no-repeat; background-position: calc( 100% - 20px ) 20px; background-size: 50px;">
                        <h2 style="color: rgb(255, 255, 255); font-size: 24px; font-weight: normal; margin: 0px; text-align: left;"
                            class="align-left">
                            <img src="https://i.ibb.co/QrPtKdb/TW-black-white-1.png" alt="TW-black-white-1" border="0" width="170" height="29"><br>
                        </h2>
                    </div>
                    <div
                        style="padding: 40px 50px; background-color: #1A2025; background-repeat: no-repeat; background-position: top; background-size: contain;">
                        <div><b><span class="size" style="font-size: 24px; color: #fff;">Forgot Your Password?</span></b><br></div>
                        <div>
                            <span style="color: #fff; font-family: Helvetica, sans-serif; font-size: 14px;">We received a request to reset your password. Use the verification code below to reset your password:</span><br>
                        </div>
                        <div style="text-align: center; margin-top: 15px;">
                            <div
                                style="background-color: #25586B; border-radius: 6px; color: #fff; display: inline-block; font-size: 30px; padding: 20px 30px;">
                                ${OTP}</div><br>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; margin-top: 15px;">
                            <div
                                style="background-image: url(../images/sampleTemplates/copy.svg); background-repeat: no-repeat; background-size: contain; height: 14px; width: 14px;">
                                <br></div>
                        </div>
                        <p style="margin: 35px 0px; line-height: 22px;">
                            <span class="size" style="font-size: 14px; margin: 35px 0px; line-height: 22px; color: #fff;">If you didn't request a password reset, please ignore this email.</span><br>
                        </p>
                        <p style="margin: 0px; line-height: 22px;">
                            <span class="size" style="font-size: 14px; margin: 0px; line-height: 22px; color: #fff;">Thank you,</span><br>
                        </p>
                        <p style="margin: 0px; line-height: 22px;">
                            <span class="size" style="font-size: 14px; margin: 0px; line-height: 22px; color: #fff;">TeamTurningWays</span><br>
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </tbody>
</table>
<div><br></div>
<div><br></div>
`;
}

function InvitationEmail(link, name) {
  return `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#FAFAFA;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:0px 0px 0px 0px">
                <div style="padding:16px 24px 16px 24px;text-align:center">
                  <img
                    alt="Sample product"
                    src="https://ci3.googleusercontent.com/meips/ADKq_Na7zpEvJFntfM1-Ucw6t5Whsn_Mt1Ppw8kIV7jYUB7B7WRStRZEY_wZZFMa2nTfvrb8l1AHcmKdVy_0JmPWfY4pW6w=s0-d-e1-ft#https://i.ibb.co/QrPtKdb/TW-black-white-1.png"
                    width="150"
                    style="width:150px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                  />
                </div>
              </div>
              <div style="padding:0px 0px 0px 0px">
                <img
                  alt="Sample product"
                  src="https://images.unsplash.com/photo-1656998019079-a7f9182c12be?q=80&amp;w=1932&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  width="600"
                  height="200"
                  style="width:600px;height:250px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <div style="height:16px"></div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:16px 24px 16px 24px"
              >
                TurningWays - Welcome Abroad!
              </h3>
              <div style="font-weight:normal;padding:8px 24px 4px 24px">
                Dear ${name},
              </div>
              <div style="font-weight:normal;padding:16px 24px 4px 24px">
                We are excited to welcome you to the TurningWays community.Your
                account has been created, and you can now log in to start
                exploring our platform.
              </div>
              <div style="font-weight:normal;padding:16px 24px 16px 24px">
                To get started, please click the button below to log in:
              </div>
              <div style="text-align:left;padding:16px 24px 16px 24px">
                <a
                  href=${link}
                  style="color:#FFFFFF;font-size:16px;font-weight:bold;background-color:#456de4;border-radius:4px;display:inline-block;padding:12px 20px;text-decoration:none"
                  target="_blank"
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 20px;mso-font-width:-100%;mso-text-raise:30"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ><span>Log In</span
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 20px;mso-font-width:-100%"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ></a
                >
              </div>
              <div style="font-weight:normal;padding:16px 24px 16px 24px">
                If you have any questions or need assistance, please don&#x27;t
                hesitate to contact us to support@turningways.com
              </div>
              <div style="font-weight:normal;padding:16px 24px 16px 24px">
                We look forward to having you as part of the Turningways
                community.
              </div>
              <div style="font-weight:normal;padding:16px 24px 4px 24px">
                Best regards,
              </div>
              <div style="font-weight:normal;padding:4px 24px 16px 24px">
                The TurningWays Team
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `;
}

module.exports = {
  emailVerification,
  forgotPasswordEmail,
  InvitationEmail,
};

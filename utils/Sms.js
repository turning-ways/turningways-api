/* eslint-disable no-console */
const axios = require("axios");

const sendOtp = async function (phone, otp) {
  // To make sure the otp is a string
  otp = otp.toString();

  // dataset
  const data = {
    to: [phone],
    from: process.env.TERMIL_SENDER_ID,
    sms: `Hi there, This is yours ${otp}`,
    type: "plain",
    api_key: process.env.TERMIL_API_KEY,
    channel: "generic",
  };
  // Sending the otp
  try {
    const response = await axios.post(
      "https://api.ng.termii.com/api/sms/send/bulk",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

const sendSms = async function (phone, message) {
  // dataset
  const data = {
    to: [phone],
    from: process.env.TERMIL_SENDER_ID,
    sms: message,
    type: "plain",
    api_key: process.env.TERMIL_API_KEY,
    channel: "generic",
  };
  // Sending the otp
  try {
    const response = await axios.post(
      "https://api.ng.termii.com/api/sms/send/bulk",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { sendOtp, sendSms };

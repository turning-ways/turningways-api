const bodyFilter = async (req, res, next) => {
  // Filter body and change any value that has "" to undefined
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] === "") {
      req.body[key] = undefined;
    }
    // Check if the key is an array
    if (Array.isArray(req.body[key])) {
      req.body[key] = req.body[key].map((item) => {
        if (item === "") {
          return undefined;
        }
        return item;
      });
    }

    // Check if the key is an object
    if (typeof req.body[key] === "object") {
      Object.keys(req.body[key]).forEach((subKey) => {
        if (req.body[key][subKey] === "") {
          req.body[key][subKey] = undefined;
        }
      });
    }
  });
  next();
};

module.exports = bodyFilter;

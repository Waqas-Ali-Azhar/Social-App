const isEmail = email => {
  const regx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regx)) return true;
  return false;
};
const isEmpty = string => {
  if (string.trim() === "") return true;
  return false;
};

exports.validateSignupData = Data => {
  let errors = {};
  if (isEmpty(Data.password)) errors.password = "Must not be empty";
  if (Data.password !== Data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(Data.handle)) error.handle = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = newUser => {
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.reduceUserDetails = data => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isEmpty(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website.trim()}`;
    } else userDetails.website = data.website;
  }

  if (!isEmpty(data.location.trim())) userDetails.location = data.location;

  return userDetails;
};

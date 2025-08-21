import "core-js/stable";
import "regenerator-runtime/runtime";
const CLIENT_URL = "https://days-counter-leichan.netlify.app/";
const BASE_URL = "https://days-counter-api-production.up.railway.app/api/";
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MIN_UPPERCASE = 1;
const PASSWORD_MIN_LOWERCASE = 1;
const PASSWORD_MIN_DIGIT = 1;
const PASSWORD_MIN_SPECIAL_CHARACTER = 1;
const parentElement = document.querySelector(".reset_password--form");
const passwordExplanationTiny = document.querySelector(
  ".password_explanation--tiny"
);
const resultMessage = document.querySelector(".result_message");

const _showMessage = function (message) {
  const messageContainer = document.querySelector(".reset_password--warning");
  messageContainer.innerHTML = message;
  messageContainer.classList.remove("hidden");
};

//element is 'page', 'spinner' or 'resultMessage'
const _openElement = function (element) {
  const page = document.querySelector(".page");
  const spinner = document.querySelector(".spinner");
  const arr = [page, spinner, resultMessage];

  arr.forEach((ele) => {
    ele.classList.add("hidden");
  });

  if (element === "page") page.classList.remove("hidden");

  if (element === "spinner") spinner.classList.remove("hidden");

  if (element === "resultMessage") resultMessage.classList.remove("hidden");
};

const _validatePassword = function (password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;

  return passwordRegex.test(password.trim());
};

const _promiseSetTimeout = function (seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const _renderPasswordExplanationTiny = function () {
  const markup = `Use ${PASSWORD_MIN_LENGTH} letters at minimam including more than ${PASSWORD_MIN_UPPERCASE} uppercase, ${PASSWORD_MIN_LOWERCASE} lowercase, ${PASSWORD_MIN_DIGIT} digit, and ${PASSWORD_MIN_SPECIAL_CHARACTER} special character!`;
  passwordExplanationTiny.innerHTML = markup;
};

const _addHandlerClickPasswordVisibility = function () {
  parentElement.addEventListener("click", function (e) {
    const btn = e.target.closest(".btn--password_visibility");
    if (!btn) return;

    const parentContainer = btn.closest("div");
    const inputField = parentContainer.querySelector("input");
    const btns = parentContainer.querySelectorAll("button");
    btns.forEach((btn) => btn.classList.toggle("hidden"));

    inputField.type = inputField.type === "password" ? "text" : "password";
  });
};

const _addHandlerSubmitPassword = function () {
  parentElement.addEventListener("submit", async function (e) {
    try {
      e.preventDefault();

      const formDataArr = [...new FormData(this)];
      const passwordArr = formDataArr
        .map((dataArr) => dataArr[1])
        .filter((input) => input.trim());

      if (passwordArr.length < 2)
        return _showMessage("Please fill the both fields.");

      if (passwordArr[0] !== passwordArr[1])
        return _showMessage(
          "These password inputs are different. Please enter the same passwords."
        );

      if (!_validatePassword(passwordArr[0]))
        return _showMessage(
          `Please u${passwordExplanationTiny.innerHTML.slice(1)}`
        );

      console.log(passwordArr);

      _openElement("spinner");

      ///send passwordArr[0] as new password with token
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const res = await fetch(`${BASE_URL}user/reset/password/send`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Breare ${token}`,
        },
        body: JSON.stringify({ password: passwordArr[0] }),
      });
      const data = await res.json();

      if (!res.ok) {
        const err = new Error(data.message);
        err.statusCode = res.status;
        err.name = data.name || "";
        throw err;
      }
      console.log(data);

      resultMessage.innerHTML = `Password successfully updated!<br />Redirecting to the login page...`;
      await _promiseSetTimeout(3);
      window.location = CLIENT_URL;
    } catch (err) {
      console.error(err);
      if (
        err.name === "ExpressValidatorError" ||
        err.name === "ValidationError"
      )
        messageContainer._showMessage(err.message);

      resultMessage.innerHTML = `Server error 🙇‍♂️ Please try again! <br> Redirecitng to the password form page...`;
      _openElement("resultMessage");
      await _promiseSetTimeout(3);
      _openElement("page");
    }
  });
};

const init = function () {
  _renderPasswordExplanationTiny();
  _addHandlerClickPasswordVisibility();
  _addHandlerSubmitPassword();
};
init();

const phoneInput = document.querySelector("#phone");
const countrySelect = document.querySelector("#phone-country");
const phoneError = document.querySelector("#phone-error");
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function fillCountries() {
    const selected = countrySelect.value;
    const countries = libphonenumber
        .getCountries()
        .map((code) => ({ code, name: countryNames.of(code) }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // The dialling code comes first so it stays readable when the closed picker cuts the name off.
    countrySelect.replaceChildren(
        ...countries.map(({ code, name }) => new Option(`+${libphonenumber.getCountryCallingCode(code)} ${name}`, code))
    );
    countrySelect.value = selected;
}

function parsePhone() {
    return libphonenumber.parsePhoneNumberFromString(phoneInput.value.trim(), {
        defaultCountry: countrySelect.value,
        extract: false,
    });
}

// The field is optional, so only a number that has been typed is checked.
function checkPhone() {
    const isValid = !phoneInput.value.trim() || Boolean(parsePhone()?.isValid());
    const country = countryNames.of(countrySelect.value);

    phoneInput.setCustomValidity(
        isValid ? "" : `Enter a valid phone number for ${country}, or leave this empty.`
    );
    if (isValid) {
        showPhoneError(false);
    }
}

function showPhoneError(show) {
    phoneError.textContent = show ? phoneInput.validationMessage : "";
    if (show) {
        phoneInput.setAttribute("aria-invalid", "true");
    } else {
        phoneInput.removeAttribute("aria-invalid");
    }
}

phoneInput.addEventListener("input", () => {
    checkPhone();
    if (phoneError.textContent) {
        showPhoneError(!phoneInput.validity.valid);
    }
});

phoneInput.addEventListener("blur", () => {
    const number = phoneInput.value.trim() ? parsePhone() : null;

    // A number typed with its own + code moves the picker to that country.
    if (number?.isValid() && number.country) {
        countrySelect.value = number.country;
    }
    checkPhone();
    showPhoneError(!phoneInput.validity.valid);
});

phoneInput.addEventListener("invalid", () => showPhoneError(true));

countrySelect.addEventListener("change", () => {
    checkPhone();
    showPhoneError(!phoneInput.validity.valid);
});

// An empty phone number is not sent at all; a filled one is sent in international format.
phoneInput.form.addEventListener("formdata", (event) => {
    const number = phoneInput.value.trim() ? parsePhone() : null;

    event.formData.delete("phone-country");
    if (number) {
        event.formData.set("phone", number.number);
    } else {
        event.formData.delete("phone");
    }
});

fillCountries();
checkPhone();

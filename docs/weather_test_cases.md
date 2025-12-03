# Weather Route Test Cases

This document outlines formal test cases for the `/weather` route in the `weather.js` file. These tests verify correct behavior under both normal and error conditions, focusing on input validation, API response handling, and user feedback.

---

## Test Case 1: Valid City Name

**Test ID:** WTH-001  
**Objective:** Verify that the application displays correct weather data for a valid city.  
**Preconditions:** Server running, valid API key loaded.  
**Test Steps:**
1. Navigate to `/weather`.
2. Enter `London` in the city input box.
3. Submit the form.

**Expected Result:**  
- Weather data for London is displayed (temperature, condition, humidity, etc.).
- No error message shown.

**Actual Result:**  
- Weather data for London is displayed and no error message is shown

**Status:**  
- _Pass_

---

## Test Case 2: Non-Existent City Name

**Test ID:** WTH-002  
**Objective:** Ensure the app handles invalid city names gracefully.  
**Preconditions:** Server running, valid API key loaded.  
**Test Steps:**
1. Navigate to `/weather`.
2. Enter `FakeCity123` in the city input box.
3. Submit the form.

**Expected Result:**  
- Error message displayed: `"city not found"` or similar.
- No crash or unhandled exception.

**Actual Result:**  
- `"city not found"` error message is displayed and no crashes or unhandles exceptions occur

**Status:**  
- _Pass_

---

## Test Case 3: Empty Input

**Test ID:** WTH-003  
**Objective:** Ensure the app handles empty city input.  
**Preconditions:** Server running, valid API key loaded.  
**Test Steps:**
1. Navigate to `/weather`.
2. Leave the city input box blank.
3. Submit the form.

**Expected Result:**  
- Error message displayed: `"Please enter a city name"` or similar.
- No API call made.

**Actual Result:**  
- `"Please enter a city name"` error message displayed.
- No API call made. 

**Status:**  
- _Pass_

---

## Test Case 4: Invalid API Key

**Test ID:** WTH-004  
**Objective:** Verify behavior when the API key is invalid.  
**Preconditions:** Replace API key in `.env` with `INVALID_KEY`.  
**Test Steps:**
1. Restart server with invalid key.
2. Navigate to `/weather`.
3. Enter `London` and submit.

**Expected Result:**  
- Error message displayed: `"Invalid API key"` or similar.
- No crash or unhandled exception.

**Actual Result:**  
- `"Invalid API key. Please see https://openweathermap.org/faq#error401 for more info."` error message displayed. 
- No crash or unhandles exception.

**Status:**  
- _Pass_

---

## Test Case 5: Network Failure

**Test ID:** WTH-005  
**Objective:** Ensure the app handles network failure gracefully.  
**Preconditions:** Disconnect internet or block outbound requests.  
**Test Steps:**
1. Navigate to `/weather`.
2. Enter `London` and submit.

**Expected Result:**  
- Error message displayed: `"Request failed"` or similar.
- No crash or unhandled exception.

**Actual Result:**  
- `"Request failed"` error message displayed.
- No crash or unhandled exception.

**Status:**  
- _Pass_

---
## Test Summary

- Total Tests: 5  
- Passed: 5  
- Failed: 0  
- Pending: 0  

All test cases for the `/weather` route passed successfully. The application handles valid input, invalid input, empty input, invalid API keys, and network failures gracefully without crashing.
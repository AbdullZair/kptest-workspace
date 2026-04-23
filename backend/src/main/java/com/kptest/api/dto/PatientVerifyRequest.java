package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Patient verification request for HIS integration.
 */
public record PatientVerifyRequest(
    @JsonProperty("pesel")
    @NotBlank(message = "PESEL is required")
    @Pattern(regexp = "^\\d{11}$", message = "PESEL must be 11 digits")
    String pesel,

    @JsonProperty("cart_number")
    @NotBlank(message = "Cart number is required")
    String cartNumber
) {
}

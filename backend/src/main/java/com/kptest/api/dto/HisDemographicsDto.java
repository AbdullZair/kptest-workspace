package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

/**
 * HIS patient demographics returned to clients.
 *
 * <p>The PESEL is masked - only the last 4 digits are visible
 * to limit exposure of sensitive personal data in responses
 * and logs.</p>
 */
public record HisDemographicsDto(
    @JsonProperty("first_name")
    String firstName,

    @JsonProperty("last_name")
    String lastName,

    @JsonProperty("pesel")
    String pesel,

    @JsonProperty("date_of_birth")
    LocalDate dateOfBirth
) {

    private static final String MASK_PREFIX = "*******";

    /**
     * Create a demographics DTO with the PESEL masked so that only
     * the last 4 digits are visible.
     *
     * @param firstName patient first name
     * @param lastName patient last name
     * @param fullPesel full PESEL number (11 digits)
     * @param dateOfBirth patient date of birth
     * @return DTO with masked PESEL
     */
    public static HisDemographicsDto maskedFrom(
        String firstName,
        String lastName,
        String fullPesel,
        LocalDate dateOfBirth
    ) {
        return new HisDemographicsDto(firstName, lastName, maskPesel(fullPesel), dateOfBirth);
    }

    /**
     * Mask all but the last 4 digits of a PESEL.
     */
    public static String maskPesel(String pesel) {
        if (pesel == null || pesel.length() < 4) {
            return MASK_PREFIX;
        }
        return MASK_PREFIX + pesel.substring(pesel.length() - 4);
    }
}

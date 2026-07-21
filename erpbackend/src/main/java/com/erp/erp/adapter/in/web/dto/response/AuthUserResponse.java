package com.erp.erp.adapter.in.web.dto.response;

import java.util.List;

public record AuthUserResponse(
        String sub,
        String username,
        String email,
        List<String> roles
) {}

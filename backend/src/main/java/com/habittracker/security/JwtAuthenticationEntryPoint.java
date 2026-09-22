package com.habittracker.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String json = String.format(
                "{\"timestamp\":\"%s\",\"status\":401,\"message\":\"%s\",\"errors\":null}",
                LocalDateTime.now(),
                authException != null && authException.getMessage() != null
                        ? authException.getMessage().replace("\"", "\\\"")
                        : "Unauthorized - Access token is missing or invalid"
        );
        response.getWriter().write(json);
    }
}

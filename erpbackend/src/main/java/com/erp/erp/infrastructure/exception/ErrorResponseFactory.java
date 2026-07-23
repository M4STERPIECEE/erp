package com.erp.erp.infrastructure.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Point unique de construction du format d'erreur JSON, utilisé à la fois
 * par le GlobalExceptionHandler (flux MVC) et par les handlers de sécurité
 * (flux filtres Servlet), afin de garantir un format de réponse identique
 * quel que soit l'endroit où l'erreur est levée.
 */
@Component
public class ErrorResponseFactory {

    private final ObjectMapper objectMapper;

    public ErrorResponseFactory(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> build(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return body;
    }

    /**
     * Écrit directement la réponse d'erreur dans le HttpServletResponse.
     * Utilisé depuis le contexte des filtres Spring Security, où l'on n'a
     * pas accès au cycle de vie MVC (pas de ResponseEntity possible).
     */
    public void write(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), build(status, message));
    }
}
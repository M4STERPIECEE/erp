FROM curlimages/curl AS downloader
RUN curl -fSL "https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc11/23.3.0.23.09/ojdbc11-23.3.0.23.09.jar" -o /tmp/ojdbc11.jar
FROM quay.io/keycloak/keycloak:26.1 AS builder
COPY --from=downloader /tmp/ojdbc11.jar /opt/keycloak/providers/ojdbc11.jar
ENV KC_DB=oracle
RUN /opt/keycloak/bin/kc.sh build
FROM quay.io/keycloak/keycloak:26.1
COPY --from=builder /opt/keycloak/ /opt/keycloak/
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

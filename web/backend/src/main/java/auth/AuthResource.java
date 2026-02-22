package auth;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import security.JwtUtils;

import java.util.Map;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @EJB
    private AuthService authService;

    @EJB
    private JwtUtils jwtUtils;

    @POST
    @Path("/login")
    public Response login(CredentialsDTO creds) {
        if (authService.checkCredentials(creds.getUsername(), creds.getPassword())) {
            return createTokenResponse(creds.getUsername());
        }
        return Response.status(Response.Status.UNAUTHORIZED).entity(Map.of("error", "Invalid credentials")).build();
    }

    @POST
    @Path("/register")
    public Response register(CredentialsDTO creds) {
        if (creds.getUsername() == null || creds.getPassword() == null) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        if (authService.register(creds.getUsername(), creds.getPassword()) != null) {
            return createTokenResponse(creds.getUsername());
        }
        return Response.status(Response.Status.CONFLICT).entity(Map.of("error", "User exists")).build();
    }

    private Response createTokenResponse(String username) {
        String token = jwtUtils.createToken(username);
        return Response.ok(Map.of(
                "success", true,
                "token", token,
                "user", Map.of("username", username)
        )).build();
    }
}
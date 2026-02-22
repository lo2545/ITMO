package points;

import auth.AuthService;
import auth.UserEntity;
import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/points")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PointResource {

    @EJB
    private PointService pointService;

    @EJB
    private AuthService authService;

    @EJB
    private AreaValidator validator;

    @POST
    @Path("/check")
    public Response check(PointDTO dto, @HeaderParam("X-Username") String username) {
        UserEntity user = authService.findByLogin(username);
        if (user == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        if (!validator.isDataValid(dto.getX(), dto.getY(), dto.getR())) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        boolean isHit = validator.check(dto.getX(), dto.getY(), dto.getR());
        PointEntity entity = new PointEntity(dto.getX(), dto.getY(), dto.getR(), isHit, user);
        pointService.save(entity);

        return Response.ok(convertToMap(entity)).build();
    }

    @GET
    @Path("/history")
    public Response history(@HeaderParam("X-Username") String username) {
        UserEntity user = authService.findByLogin(username);
        if (user == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        List<PointEntity> list = pointService.getHistory(user);
        return Response.ok(list.stream().map(this::convertToMap).collect(Collectors.toList())).build();
    }

    @DELETE
    @Path("/clear")
    public Response clearHistory(@HeaderParam("X-Username") String username) {
        UserEntity user = authService.findByLogin(username);
        if (user == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        pointService.clearHistory(user);
        return Response.ok().build();
    }

    private Map<String, Object> convertToMap(PointEntity p) {
        return Map.of(
                "x", p.getX(),
                "y", p.getY(),
                "r", p.getR(),
                "result", p.isResult(),
                "checkTime", p.getCheckTime().toString()
        );
    }
}
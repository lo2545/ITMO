package points;
import auth.UserEntity;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "points")
public class PointEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double x;
    private double y;
    private double r;
    private boolean hit;
    private LocalDateTime checkTime;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private UserEntity owner;

    public PointEntity() {}

    public PointEntity(double x, double y, double r, boolean hit, UserEntity owner) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.hit = hit;
        this.owner = owner;
        this.checkTime = LocalDateTime.now();
    }

    public double getX() { return x; }
    public double getY() { return y; }
    public double getR() { return r; }
    public boolean isResult() { return hit; }
    public LocalDateTime getCheckTime() { return checkTime; }
}
package points;

import auth.UserEntity;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class PointService {

    @PersistenceContext(unitName = "default")
    private EntityManager em;

    public void save(PointEntity point) {
        em.persist(point);
    }

    public List<PointEntity> getHistory(UserEntity user) {
        return em.createQuery("SELECT p FROM PointEntity p WHERE p.owner = :user ORDER BY p.checkTime DESC", PointEntity.class)
                .setParameter("user", user)
                .getResultList();
    }

    public void clearHistory(UserEntity user) {
        em.createQuery("DELETE FROM PointEntity p WHERE p.owner = :user")
                .setParameter("user", user)
                .executeUpdate();
    }
}
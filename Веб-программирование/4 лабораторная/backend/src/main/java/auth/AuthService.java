package auth;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class AuthService {

    @PersistenceContext(unitName = "default")
    private EntityManager em;

    public UserEntity register(String login, String passwordHash) {
        if (findByLogin(login) != null) return null;
        UserEntity user = new UserEntity(login, passwordHash);
        em.persist(user);
        return user;
    }

    public boolean checkCredentials(String login, String passwordHash) {
        UserEntity user = findByLogin(login);
        if (user == null) return false;
        return passwordHash.equals(user.getPassword());
    }

    public UserEntity findByLogin(String login) {
        try {
            return em.createQuery("SELECT u FROM UserEntity u WHERE u.username = :login", UserEntity.class)
                    .setParameter("login", login)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }
}
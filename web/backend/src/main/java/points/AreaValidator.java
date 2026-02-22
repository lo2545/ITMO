package points;

import jakarta.ejb.Stateless;

@Stateless
public class AreaValidator {

    public boolean check(double x, double y, double r) {
                if (r == 0) {
            return false;
        }

        double absR = Math.abs(r);
        if (r < 0) {
            x = -x;
            y = -y;
        }

        if (x >= 0 && y >= 0) {
            return x <= absR / 2.0 && y <= absR;
        }
        if (x <= 0 && y >= 0) {
            return (x * x + y * y) <= (absR / 2.0 * absR / 2.0);
        }
        if (x <= 0 && y <= 0) {
            return y >= -x - absR;
        }
        return false;
    }

    public boolean isDataValid(Double x, Double y, Double r) {
        return x != null && y != null && r != null &&
                x >= -3 && x <= 3 &&
                y >= -5 && y <= 3 &&
                r >= -3 && r <= 3;      }
}
package Models;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class User_DAO {
    public User getUserById(String userId) {
        User user = null;
        try (Connection connection = DBConnector.getConnection()) {
            String sql = "SELECT * FROM user_in4 WHERE id = ?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
                preparedStatement.setString(1, userId);
                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    if (resultSet.next()) {
                        user = new User();
                        user.setId(resultSet.getString("id"));
                        user.setUsername(resultSet.getString("username"));
                        user.setEmail(resultSet.getString("email"));
                        user.setPassword(resultSet.getString("password"));
                        user.setPhoneNumber(resultSet.getString("phone_number"));
                        user.setAvatarPath(resultSet.getString("avatar_path"));
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return user;
    }
}

document.getElementById('registrationForm').addEventListener('submit', submitRegistrationForm);
function submitRegistrationForm(event) {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');

    // Проверка на совпадение паролей
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match. Please check!';
        errorMessage.style.color = 'red';
    } else {
        // Логика отправки данных на сервер (можно добавить серверную обработку)
        console.log('Registration data:', { username, password });

        alert('Registration successful!');
        errorMessage.textContent = '';
    }
}
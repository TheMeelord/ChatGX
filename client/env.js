const SERVER_URL = "http://127.0.0.1:5000";
const baseUrl = "ws://127.0.0.1:5000/ws/connect/";

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

async function verifiedUser() {
    const token = getCookie('token');
    const apiUrl = `${SERVER_URL}/user/verify/${token}`;

    let ind = false;

    try {
        const response = await $.ajax({
            type: "GET",
            url: apiUrl,
        });
        console.log(typeof response.verified);
        console.log("verified:", response.verified);
        console.log(response.verified === true);
        ind = response.verified === true;
        return true
    } catch (error) {
        ind = false;
        console.error("Ошибка при верификации:", error);
    }
    console.log("ind:", ind);
    return ind;
}

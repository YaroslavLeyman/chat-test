import bot from "./assets/bot.svg"
import user from "./assets/user.svg"

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
      // Обновление текстового содержимого индикатора загрузки
      element.textContent += '.';

      // Если индикатор загрузки достиг трех точек, сбрасываем его
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index);
          index++;
      } else {
          clearInterval(interval);
      }
  }, 20)
}

// генерируем уникальный идентификатор для каждого сообщения div бота
// необходимо для ввода текстового эффекта для конкретного ответа
// без уникального идентификатора ввод текста будет работать с каждым элементом
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // полоса чата пользователя
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // очистить ввод текстовой области
  form.reset();

  // полоса чата бота
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // сфокусироваться, прокрутить страницу вниз
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // сообщение div 
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  // извлечение данных с сервера -> ответ бота
  const response = await fetch('https://open-ai-chat-epa6.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // обрезает все конечные пробелы/'\n' 

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})
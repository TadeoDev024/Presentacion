document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  const subject = `Nuevo mensaje de ${name}`;
  const body = `De: ${name} (${email})%0D%0A%0D%0A${message}`;

  window.location.href = `mailto:tuemail@gmail.com?subject=${subject}&body=${body}`;

  document.getElementById("status").innerText = "Abriendo cliente de correo...";
});

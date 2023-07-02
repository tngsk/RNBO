document.addEventListener("audioIn", (e) => {
	let htmlTag = document.getElementById("html");
	htmlTag.classList.add("bang");
	setTimeout(() => {
		htmlTag.classList.remove("bang");
	}, 200);
});

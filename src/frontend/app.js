const apiEndpoint = 
    "https://webapp-210-300621-girard-alexis-dta6b3hvceexgjfg.northeurope-01.azurewebsites.net/api/tasks";
  // "https://backend-210-300621-alexis-girard.blacksky-0acd1103.westeurope.azurecontainerapps.io/api/tasks";

$(document).ready(function () {
  // Charger les tâches au démarrage
  loadTasks();

  // Ajouter une nouvelle tâche
  $("#todo-form").on("submit", async function (e) {
    e.preventDefault();

    const description = $("#todo-input").val().trim();
    if (description === "") return;

    const task = { description: description };

    try {
      await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      loadTasks();
      $("#todo-input").val(""); // Réinitialiser le champ
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche :", error);
    }
  });

  // Marquer une tâche comme terminée (ou non)
  $("#todo-list").on("click", ".task-toggle", async function () {
    const $taskElement = $(this).closest("li"); // Trouve l'élément li parent
    const taskId = $taskElement.data("id");
    const isCompleted = $taskElement.hasClass("completed");

    // Récupère le texte directement comme un nœud
    const description = $taskElement.find(".task-text")
      .contents()
      .filter(function () {
        return this.nodeType === 3; // Node type 3 = texte
      })
      .text()
      .trim();

    console.log("Description trouvée :", description);

    if (!description) {
      console.error("Erreur : la description de la tâche est vide !");
      return;
    }

    // Prépare l'objet mis à jour
    const updatedTask = {
      id: taskId,
      description: description,
      completed: !isCompleted,
    };

    try {
      await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      loadTasks(); // Recharge les tâches après mise à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error);
    }
  });

  // Supprimer une tâche
  $("#todo-list").on("click", ".delete-btn", async function (e) {
    e.stopPropagation(); // Empêcher le clic sur la tâche elle-même
    const taskId = $(this).parent().data("id");

    try {
      await fetch(`${apiEndpoint}?id=${taskId}`, {
        method: "DELETE",
      });
      loadTasks();
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche :", error);
    }
  });

  // Charger les tâches depuis l'API
  async function loadTasks() {
    try {
      const response = await fetch(apiEndpoint);
      const tasks = await response.json();

      // Trier les tâches : non complétées d'abord, complétées ensuite
      tasks.sort((a, b) => a.completed - b.completed);

      // Effacer la liste et ajouter les tâches
      $("#todo-list").empty();
      tasks.forEach((task) => {
        const listItem = $("<li>")
          .data("id", task.id)
          .addClass(task.completed ? "completed" : "")
          .append($("<div>").text(task.description).addClass("task-text"))
          .append($("<button>").text("Delete").addClass("delete-btn"))
          .prepend(
            $("<input>")
              .attr("type", "checkbox")
              .addClass("task-toggle")
              .prop("checked", task.completed) // Utilisation correcte de "completed"
          );

        $("#todo-list").append(listItem);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des tâches :", error);
    }
  }
});

async function fetchTaskCount() {
  try {
      // URL de ton Azure Function
      const response = await fetch("https://210-functionapp-girard.azurewebsites.net/api/TriggerHttp");
      
      // Vérifier si la requête a réussi
      if (!response.ok) {
          throw new Error("Erreur lors de la récupération du nombre de tâches");
      }

      // Lire la réponse et mettre à jour l'affichage
      const taskCount = await response.text();
      document.getElementById("taskCount").textContent = taskCount;
  } catch (error) {
      console.error("Erreur :", error);
      document.getElementById("taskCount").textContent = "Erreur";
  }
}

// Jouer de la musique 
const musicBtn = document.getElementById("music-btn");
const music = document.getElementById("music");

musicBtn.addEventListener("click", function() {
  if (music.paused) {
    music.play(); // Joue la musique si elle est en pause
    musicBtn.innerText = "🎵 Stopper la musique"
  } else {
    music.pause(); // Pause la musique si elle joue déjà
    
    musicBtn.innerText = "🎵 Lancer la musique"
  }
});

// Charger le nombre de tâches au démarrage de la page
document.addEventListener("DOMContentLoaded", fetchTaskCount);


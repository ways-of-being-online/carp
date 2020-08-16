const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".items");

hamburger.addEventListener("click", function() {
  hamburger.classList.toggle("is-active");
  menu.classList.toggle("is-active");
});

const filterList = document.getElementById("filter-list");
const projectList = document.getElementById("project-list");
const display = document.getElementById("display");

const allFilterButton = document.createElement("button");
allFilterButton.innerHTML = "All";
allFilterButton.id = "all-filter-button";
allFilterButton.classList.add("filt");
allFilterButton.classList.add("active");
filterList.appendChild(allFilterButton);
allFilterButton.addEventListener("click", getArchive);



const displayContainer = document.createElement("div");
displayContainer.className = "display";

const axiosArena = axios.create({ baseURL: "https://api.are.na/v2/" });
axiosArena.defaults.headers.Authorization = 'Bearer ---' ;

function getFilters() {
  displayContainer.innerHTML = "";
  axiosArena.get("channels/all-filters").then(response => {
    if (response.data && response.data.contents.length > 0) {
      createFilterList(response.data.contents);
    }
  });
}

function getArchive() {
  const allButtons = document.getElementsByClassName("filt");
  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].classList.remove("active");
  }

  displayContainer.innerHTML = "";
  projectList.innerHTML = "";
  allFilterButton.classList.add("active");
  let showDataByOrgLabel = document.createElement("small");
  showDataByOrgLabel.innerHTML = "Browse by organization:";
  projectList.appendChild(showDataByOrgLabel);
  axiosArena.get("channels/agn-archive").then(response => {
    if (response.data && response.data.contents.length > 0) {
      createProjectList(response.data.contents);
    }
  });
}

function createFilterList(data) {
  data.map((fil) => {
    let filterName = document.createElement("button");
    let name = fil.title;
    name = name.replace(/\b(\w*AGN\w*)\b/, "");
    name = name.replace(/♺/, "");
    filterName.classList.add("filt");
    filterName.id = fil.slug;
    filterName.addEventListener("click", filterProjectsOnClick.bind(filterName));
    filterName.innerHTML = name;

    filterList.appendChild(filterName);
  })
}

function createProjectList(data) {
  if (data) {
    data.map((proj) => {
      let projectName = document.createElement("p");
      let name = proj.title;
      let description = proj.metadata.description;
      name = name.replace(/☁/, "");
      projectName.classList.add("project-name");
      projectName.innerHTML = name;
      projectList.appendChild(projectName);

      projectName.addEventListener("click", showProjectOnClick.bind(proj));

      axiosArena.get(`channels/${proj.slug}`).then(response => {
        if (response.data && response.data.contents.length > 0) {
          showAllDataFromAllProjects(response.data.contents, name, description);
        }
      });
    })
  }
}

function showAllDataFromAllProjects(data, name, desc) {
  data.map((proj) => {
    if (proj.title) {
      let projectBlock = document.createElement("div");

      projectBlock.innerHTML = proj.title;
      projectBlock.id = slugify(proj.title);

      if (proj.title && proj.source) {
        projectBlock.className = "project-block video-block";
        let video = document.createElement("div");
        video.className = "video";
        video.innerHTML = proj.embed.html;
        projectBlock.appendChild(video);
        displayContainer.appendChild(projectBlock);
      } else if (proj.title && proj.image) {
        projectBlock.className = "project-block image-block";
        let image = document.createElement("img");
        image.className = "image";
        image.src = proj.image.original.url;
        image.alt = proj.title;
        projectBlock.appendChild(image);
        displayContainer.appendChild(projectBlock);
      }
    }
  })

  display.appendChild(displayContainer);
}

function filterProjectsOnClick(button, fil) {
  const allElements = document.getElementsByClassName("project-block");
  const allButtons = document.getElementsByClassName("filt");

  if (this.classList.contains('active')) {
    this.classList.remove('active');
    getArchive();
  } else {
    for (var i = 0; i < allButtons.length; i++) {
      allButtons[i].classList.remove("active");
    }
    this.classList.add('active');
  }
  console.log(this);
  for (var i = 0; i < allElements.length; i++) {
    allElements[i].style.display = "none";
  }

  axiosArena.get(`channels/${this.id}`).then(response => {
    if (response.data && response.data.contents.length > 0) {
      toggleFilteredItems(response.data.contents);
    }
  });
}

function toggleFilteredItems(data) {
  const allElements = document.getElementsByClassName("project-block");

  data.map((dat) => {
    const title = slugify(dat.title);
    const element = document.getElementById(title);
    for (var i = 0; i < allElements.length; i++) {
      if (allElements[i].id === title) {
        allElements[i].style.display = "flex";
      }
    }
  })
}

function showProjectOnClick() {
  const button = document.getElementById(this.slug);
  let projectName = document.createElement("h2");
  let projectDesc = document.createElement("h3");
  const allFilterButton = document.getElementById("all-filter-button");
  allFilterButton.classList.contains("active") ? allFilterButton.classList.remove("active") : null;
  projectName.innerHTML = this.title;
  projectDesc.innerHTML = this.metadata.description;
  displayContainer.innerHTML = "";
  displayContainer.appendChild(projectName);
  displayContainer.appendChild(projectDesc);

  axiosArena.get(`channels/${this.slug}`).then(response => {
    if (response.data && response.data.contents.length > 0) {
      displayProject(response.data.contents);
    }
  });
}

function displayProject(data) {
  data.map((proj) => {
    if (proj.title) {
      let projectBlock = document.createElement("div");

      projectBlock.innerHTML = proj.title;
      projectBlock.id = slugify(proj.title);

      if (proj.title && proj.source) {
        projectBlock.className = "project-block video-block";
        let video = document.createElement("div");
        video.className = "video";
        video.innerHTML = proj.embed.html;
        projectBlock.appendChild(video);
        displayContainer.appendChild(projectBlock);
      } else if (proj.title && proj.image) {
        projectBlock.className = "project-block image-block";
        let image = document.createElement("img");
        image.className = "image";
        image.src = proj.image.original.url;
        image.alt = proj.title;
        projectBlock.appendChild(image);
        displayContainer.appendChild(projectBlock);
      }

    }
  })

  display.appendChild(displayContainer);
}

function slugify (str) {
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.toLowerCase();
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  str = str.replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  return str;
}

getArchive();
getFilters();

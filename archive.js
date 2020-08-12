const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".items");
hamburger.addEventListener("click", function() {
  hamburger.classList.toggle("is-active");
  menu.classList.toggle("is-active");
});

const filterList = document.getElementById("filter-list");
const projectList = document.getElementById("project-list");
const display = document.getElementById("display");

const displayProjectRow = document.createElement("div");
displayProjectRow.className = "display";

const axiosArena = axios.create({
  baseURL: "https://api.are.na/v2/",
});

let loading = document.createElement("div");
loading.className = "loading";
loading.innerHTML = 'loading...';
projectList.appendChild(loading);

axiosArena.defaults.headers.Authorization = 'Bearer ---' ;

axiosArena.get("channels/all-filters").then(response => {
  if (response.data && response.data.contents.length > 0) {
    createFilterList(response.data.contents);
  }
});

axiosArena.get("channels/agn-archive").then(response => {
  if (response.data && response.data.contents.length > 0) {
    createProjectList(response.data.contents);
    projectList.removeChild(loading);
  }
});



function createFilterList(data) {
  let allFilterButton = document.createElement("button");
  allFilterButton.innerHTML = "All";
  allFilterButton.id = "all-filter-button";
  allFilterButton.classList.add("filt");
  allFilterButton.classList.add("active");
  filterList.appendChild(allFilterButton);
  allFilterButton.addEventListener("click", filterProjectsOnClick);

  data.map((fil) => {
    let filterName = document.createElement("button");
    let name = fil.title;
    name = name.replace(/\b(\w*AGN\w*)\b/, "");
    name = name.replace(/♺/, "");
    filterName.classList.add("filt");
    filterName.id = fil.slug;
    filterName.addEventListener("click", filterProjectsOnClick.bind(fil));
    filterName.innerHTML = name;

    filterList.appendChild(filterName);
  })
}

function createProjectList(data) {
  let seeAllGraphics = document.createElement("p");
  seeAllGraphics.style.marginBottom = "46px";
  seeAllGraphics.innerHTML = "See All Graphics";
  let showDataByOrgLabel = document.createElement("small");
  showDataByOrgLabel.innerHTML = "Browse by organization:";

  projectList.appendChild(seeAllGraphics);
  projectList.appendChild(showDataByOrgLabel);
  seeAllGraphics.addEventListener("click", reDisplayAllDataFromAllProjects);

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
      projectBlock.className = "project-block";
      projectBlock.innerHTML = proj.title;
      projectBlock.id = slugify(proj.title);

      if (proj.image) {
        let image = document.createElement("img");
        image.className = "image";
        image.src = proj.image.original.url;
        image.alt = proj.title;
        projectBlock.appendChild(image);
      }
      displayProjectRow.appendChild(projectBlock)
    }
  })


  display.appendChild(displayProjectRow);
}

function reDisplayAllDataFromAllProjects() {
  display.innerHTML = "";
  displayProjectRow.innerHTML = "";
  projectList.innerHTML = "";
  axiosArena.get("channels/agn-archive").then(response => {
    if (response.data && response.data.contents.length > 0) {
      createProjectList(response.data.contents);
      projectList.removeChild(loading);
    }
  });
}


function filterProjectsOnClick() {
  const allElements = document.getElementsByClassName("project-block");
  const allButtons = document.getElementsByClassName("filt");
  if (this.innerHTML === "All") {
    if (this.classList.contains('active')) {
      this.classList.remove('active');
    } else {
      for (var i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove("active");
      }
      this.classList.add('active');
    }
    for (var i = 0; i < allElements.length; i++) {
      allElements[i].style.display = "flex";
    }

  } else {
    const button = document.getElementById(this.slug);
    const allFilterButton = document.getElementById("all-filter-button");
    if (allFilterButton.classList.contains('active')) { allFilterButton.classList.remove('active') }
    if (button.classList.contains('active')) {
      button.classList.remove('active');
    } else {
      button.classList.add('active');
    }

    for (var i = 0; i < allElements.length; i++) {
      allElements[i].style.display = "none";
    }

    axiosArena.get(`channels/${this.slug}`).then(response => {
      if (response.data && response.data.contents.length > 0) {
        toggleFilteredItems(response.data.contents);
      }
    });
  }
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
  displayProjectRow.innerHTML = "";
  displayProjectRow.appendChild(projectName);
  displayProjectRow.appendChild(projectDesc);

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
      projectBlock.className = "project-block";
      projectBlock.innerHTML = proj.title;
      projectBlock.id = slugify(proj.title);

      if (proj.image) {
        let image = document.createElement("img");
        image.className = "image";
        image.src = proj.image.original.url;
        image.alt = proj.title;
        projectBlock.appendChild(image);
      }
      displayProjectRow.appendChild(projectBlock)
    }
  })

  display.appendChild(displayProjectRow);
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

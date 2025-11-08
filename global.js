console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// //2.1
// const navLinks = $$("nav a");

// //2.2
// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );

// //2.3
// if (currentLink) {
//   // or if (currentLink !== undefined)
//   currentLink.classList.add('current');
// }


//3.1

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name


let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects'},
  { url: 'contact/', title: 'Contact'},
  { url: 'resume/', title: 'Resume'},
  { url: 'meta/', title: "Meta" },
  { url: 'https://github.com/bryannbr', title: 'Github'},
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  if (!url.startsWith('http')) {
  url = BASE_PATH + url;
    }


    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Highlight current page (like Step 2)
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    // Open external links in a new tab
    if (a.host !== location.host) {
        a.target = '_blank';
    }

    // Add to nav
    nav.append(a);
    nav.append(' | ');


}


//4.2
document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select id="theme-switch">
			<option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
		</select>
	</label>`,
);
// Get the select element
const themeSwitch = document.getElementById('theme-switch');

// When user changes selection, update the color scheme
themeSwitch.addEventListener('change', (e) => {
  document.documentElement.style.colorScheme = e.target.value;
});

//4.4
const select = document.querySelector('#theme-switch');

select.addEventListener('input', (event) => {
  console.log('color scheme changed to', event.target.value);
  // set the inline style on <html>
  document.documentElement.style.setProperty('color-scheme', event.target.value);
});

//4.5

// Helper function to set the color scheme
function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  themeSwitch.value = scheme;
}

// Load the saved theme on page load (if it exists)
if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// Update theme + save on change
themeSwitch.addEventListener('input', (event) => {
  const newScheme = event.target.value;
  setColorScheme(newScheme);
  localStorage.colorScheme = newScheme;
});

//Hey


//lab4 1.2 

export async function fetchJSON(url) {
  try {
    //here is used to retrive the JSOn from the URL link
    const response = await fetch(url);

    console.log(response); // to debug

    // throw error in case of invalid responses
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    // return the json after parsing
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}


//1.4
export function renderProjects(projects, container, headingLevel = 'h2') {
  try {
    if (!container) {
      console.error('renderProjects: container not found');
      return;
    }
    if (!Array.isArray(projects)) {
      console.error('renderProjects: projects is not an array');
      return;
    }
    // Optional: show a friendly message if empty
    if (projects.length === 0) {
      container.innerHTML = `<p>No projects to display yet.</p>`;
      return;
    }

    // Build the articles with a template literal
    const html = projects.map(p => `
      <article class="project">
        <${headingLevel} class="project__title">${p.title}</${headingLevel}>
        <img class="project__img" src="${p.image}" alt="${p.title}">
        <div class="project__text">
          <p class="project__desc">${p.description}</p>
          <span class="project__year">c. ${p.year}</span>
        </div>
      </article>
    `).join('');

    // Replace any hardcoded content
    container.innerHTML = html;
  } catch (err) {
    console.error('renderProjects error:', err);
  }
}


//3.2 
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}











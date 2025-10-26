//lab 4 1.3


import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');


const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');


//1.6
const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Project${projects.length !== 1 ? 's' : ''}`;
}
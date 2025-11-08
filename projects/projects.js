//lab 4 1.3
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';



import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');




const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

renderPieChart(projects);

//5.2
let selectedIndex = -1;


//5.3

//4.4
function renderPieChart(projectsGiven) {
  // --- recompute grouped data (projects per year) ---
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  // optional: keep years ascending so legend looks tidy
  rolledData.sort((a, b) => (+a[0]) - (+b[0]));

  // convert to { value, label } that the pie/legend code expects
  let data = rolledData.map(([year, count]) => ({
    value: count,
    label: year,
  }));

  // --- clear previous pie + legend before re-rendering ---
  const svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();                     // clear slices
  d3.select('.legend').selectAll('*').remove();       // clear legend items

  // --- (re)build pie ---
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const arcs = arcData.map((d) => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcs.forEach((arc, idx) => {
    svg.append('path').attr('d', arc).attr('fill', colors(idx)).on('click', () => {
      // toggling select
      selectedIndex = selectedIndex === idx ? -1 : idx;

      // update classes for all slices
      svg.selectAll('path')
        .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');

      // update legend highlight display
      d3.select('.legend')
        .selectAll('li')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
    
      //5.3
      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');  // Show all
      } else {
        const year = data[selectedIndex].label;
        const filtered = projects.filter(p => p.year === year);
        renderProjects(filtered, projectsContainer, 'h2');
      }
    });
  });

  // --- (re)build legend (same markup you used in 2.2) ---
  const legend = d3.select('.legend');
  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

//4.1 
let query = '';
//4.2/4.3
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  // update query value
  //lowercase it
  query = event.target.value.trim().toLowerCase();
  
  //filter by project title by any field like title year desceiptio etc.

  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  // TODO: render updated projects!
  renderProjects(filteredProjects, projectsContainer, 'h2');

  //update the pie and legend to only the current display projcets
  renderPieChart(filteredProjects);


});

//1.6
const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Project${projects.length !== 1 ? 's' : ''}`;
}

//lab 5
const svg = d3.select('#projects-pie-plot');




// const arcPath = arcGenerator({
//   startAngle: 0,
//   endAngle: 2 * Math.PI
// });

// svg.append('path')
//   .attr('d', arcPath)
//   .attr('fill', 'red');
//1.5 
// let data = [
//   { value: 1, label: 'apples' },
//   { value: 2, label: 'oranges' },
//   { value: 3, label: 'mangos' },
//   { value: 4, label: 'pears' },
//   { value: 5, label: 'limes' },
//   { value: 5, label: 'cherries' },
// ];

//3.1
let rolledData = d3.rollups(
  projects,          // your fetched array
  (v) => v.length,   // count in each bucket
  (d) => d.year      // group key
);

// 2) sort years (ascending). remove this if you prefer unsorted
rolledData.sort((a, b) => (+a[0]) - (+b[0]));

// 3) convert to the structure the pie/legend expects
let data = rolledData.map(([year, count]) => ({
  value: count,
  label: year
}));


//manual angle/arcData calculation
// let total = 0;
// for (let d of data) {
//   total += d;
// }

// let angle = 0;
// let arcData = [];
// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }


//implement using D3's built in pie generator insead of looping manually. 
let sliceGenerator = d3.pie()
  .value((d) => d.value);

let arcData = sliceGenerator(data);



const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);



//2.2
let legend = d3.select('.legend');

data.forEach((d, idx) => {
  legend.append('li')
    .attr('style', `--color:${colors(idx)}`)
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});






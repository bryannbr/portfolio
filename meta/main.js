// meta/main.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';  // ← new

let xScale;
let yScale;


// Step 1.1 lab 8
let commitProgress = 100;
let timeScale;
let commitMaxTime;

// 2.4
const colors = d3.scaleOrdinal(d3.schemeTableau10);









async function loadData() {
  // Parse the CSV and convert types per the lab
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line:   Number(row.line),    // or +row.line
    depth:  Number(row.depth),
    length: Number(row.length),
    date:     new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

// keep this while checking structure in the console
const data = await loadData();
console.log(data);

// quick summary so you see something on the page too
const uniqueFiles = new Set(data.map(d => d.file));
const totalLines = data.length;             // one CSV row per line of code
const totalChars = d3.sum(data, d => d.length);

document.getElementById('stats').innerHTML = `
  <p><strong>Files:</strong> ${uniqueFiles.size}</p>
  <p><strong>Total lines:</strong> ${totalLines.toLocaleString()}</p>
  <p><strong>Total characters:</strong> ${totalChars.toLocaleString()}</p>
`;

//1.2 commit processing function
function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)   // [[commitId, lines[]], ...]
    .map(([commit, lines]) => {
      // all rows in one commit share these fields → take from first line
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;

      // build the commit object (basic + derived fields)
      const ret = {
        id: commit,
        // 👉 replace YOUR_USER/YOUR_REPO to match your GitHub repo path
        url: 'https://github.com/YOUR_USER/YOUR_REPO/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60, // e.g., 14.5 for 2:30pm
        totalLines: lines.length, // number of lines touched by this commit
      };

      // keep the raw lines array, but hide it from normal console printing
      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,   // hide from for...in / JSON.stringify / console tables
        writable: false,
        configurable: false,
      });

      return ret;
    });
}


const commits = processCommits(data);
console.log(commits);

// Step 1.2 lab 8 — start with all commits selected
let filteredCommits = commits;




//2.1 lab 8
function updateFileDisplay(filteredCommits) {
  // all line records for the currently visible commits
  const lines = filteredCommits.flatMap((d) => d.lines);

  // group those lines by file name
  const files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  // bind files to <div> elements inside #files
  const filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(
      // runs only when a file's <div> is first created
      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt').append('code');
          div.append('dd');
        }),
    );

  // update filename text
  filesContainer
    .select('dt > code')
    .text((d) => d.name);

  // update line-count text
  filesContainer
    filesContainer
    .select('dd')
    .selectAll('div')
    .data((d) => d.lines)
    .join('div')
    .attr('class', 'loc')
    .attr('style', d => `--color: ${colors(d.type)}`);
}




// Step 1.1 lab 08 — time scale for mapping 0–100 to actual timestamps
timeScale = d3.scaleTime()
  .domain([
    d3.min(commits, d => d.datetime),
    d3.max(commits, d => d.datetime)
  ])
  .range([0, 100]);

// Convert slider % → date
commitMaxTime = timeScale.invert(commitProgress);


function onTimeSliderChange() {
  const slider = document.querySelector("#commit-progress");
  const timeEl = document.querySelector("#commit-time");

  // 1) update percentage
  commitProgress = +slider.value;

  // 2) map 0–100 → actual Date
  commitMaxTime = timeScale.invert(commitProgress);

  // 3) show the date/time
  timeEl.textContent = commitMaxTime.toLocaleString();

  // Step 1.2 — filter commits up to this time
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);

  // Step 1.2 — update the scatter plot using filteredCommits
  updateScatterPlot(data, filteredCommits);
  updateFileDisplay(filteredCommits);
}


const slider = document.querySelector("#commit-progress");
if (slider) {
  slider.addEventListener("input", onTimeSliderChange);
}








function renderCommitInfo(data, commits) {
  // create the <dl>
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Number of files
  const numFiles = new Set(data.map(d => d.file)).size;
  dl.append('dt').text('Files in codebase');
  dl.append('dd').text(numFiles);

  // Maximum depth
  const avgLineLength = Math.round(d3.mean(data, d => d.length));
  dl.append('dt').text('Average line length (chars)');
  dl.append('dd').text(avgLineLength);

  // Longest line length (characters)
  const longestLine = d3.max(data, d => d.length);
  dl.append('dt').text('Longest line length (chars)');
  dl.append('dd').text(longestLine);

  
}
function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}
//visibility for tool tip
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}
//positional for tool tip
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 12}px`; // slight offset feels nicer
  tooltip.style.top = `${event.clientY + 12}px`;
}
//5.1
function createBrushSelector(svg) {
  svg.call(d3.brush().on('start brush end', brushed));

  // Raise dots and everything after overlay
  svg.selectAll('.dots, .overlay ~ *').raise();
}
//5.4
function brushed(event) {
  const selection = event.selection; // [[x0, y0], [x1, y1]]

  d3.selectAll('circle')
    .classed('selected', d => isCommitSelected(selection, d));

  renderSelectionCount(selection);  // <— update the text
  // 5.6 (language breakdown)
  renderLanguageBreakdown(selection);

}
function isCommitSelected(selection, commit) {
  if (!selection) return false;

  const [[x0, y0], [x1, y1]] = selection;

  // Convert commit data to pixel positions
  const cx = xScale(commit.datetime);
  const cy = yScale(commit.hourFrac);

  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}
//5.5 
function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter(d => isCommitSelected(selection, d))
    : [];

  const el = document.querySelector('#selection-count');
  el.textContent = `${selectedCommits.length || 'No'} commits selected`;

  return selectedCommits; // optional, but handy if you want to use it later
}
//5.6
function renderLanguageBreakdown(selection) {
  // Which commits are currently brushed?
  const selectedCommits = selection
    ? commits.filter(d => isCommitSelected(selection, d))
    : [];

  const container = document.getElementById('language-breakdown');

  // If nothing is selected, clear the panel and stop
  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Collect all line records from the selected commits
  const lines = selectedCommits.flatMap(d => d.lines);

  // Count lines per language (the CSV has `type` per line)
  const breakdown = d3.rollup(
    lines,
    v => v.length,   // count lines
    d => d.type      // by language/type
  );

  // Render as a definition list
  container.innerHTML = '';
  const total = lines.length;
  for (const [language, count] of breakdown) {
    const proportion = count / total;
    const formatted = d3.format('.1%')(proportion);
    container.innerHTML += `
      <dt>${language ?? 'Unknown'}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}
function renderScatterPlot(data, commits) {
  // dimensions
  const width = 1000;
  const height = 600;

  //4.3
  const sortedCommits = commits.slice().sort((a, b) => b.totalLines - a.totalLines);


  // svg
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // scales
  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  // lab 6 4.1
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
  .domain([minLines, maxLines])
  .range([2, 30]);


  // dots


  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(sortedCommits, d => d.id)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    // hover behaviors
    .on('mouseenter', (event, commit) => {
        renderTooltipContent(commit);   // <-- Update tooltip content
        updateTooltipVisibility(true);
        updateTooltipPosition(event); // reposition the tooptip
        d3.select(event.target).attr('fill', 'orange'); // optional highlight
    })
    .on('mousemove', (event) => {
        updateTooltipPosition(event);
        
    })
    .on('mouseleave', (event) => {
        updateTooltipVisibility(false);
        d3.select(event.target).attr('fill', 'steelblue');
    });
    
    

    // Margins for axes
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };

  const usableArea = {
    left: margin.left,
    right: width - margin.right,
    top: margin.top,
    bottom: height - margin.bottom,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Update scale ranges to use margins
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);


  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
  d3.axisLeft(yScale)
    .tickFormat('') // no labels
    .tickSize(-usableArea.width) // full-width lines
    );


  

  // X axis (bottom)
  const xAxis = d3.axisBottom(xScale);

  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis')   // NEW
    .call(xAxis);

  // Y axis (left) — formatted like clock times
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis')   // (for consistency)
    .call(yAxis);


    createBrushSelector(svg);

}
//lab 08 1.2
function updateScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  const usableArea = {
    left: margin.left,
    right: width - margin.right,
    top: margin.top,
    bottom: height - margin.bottom,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Select the existing SVG and groups
  const svg = d3.select('#chart').select('svg');

  // Update x-scale domain based on FILTERED commits
  xScale.domain(d3.extent(commits, d => d.datetime));

  // Recompute size scale
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  const xAxis = d3.axisBottom(xScale);

  // === Update the existing x-axis (no new <g>) ===
  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);

  // === Update dots ===
  const dots = svg.select('g.dots');
  const sortedCommits = commits.slice().sort((a, b) => b.totalLines - a.totalLines);

  dots
    .selectAll('circle')
    .data(sortedCommits, d => d.id)   // key by commit id
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
      d3.select(event.target).attr('fill', 'orange');
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      updateTooltipVisibility(false);
      d3.select(event.target).attr('fill', 'steelblue');
    });
}
// 3.2 – generate commit text for scrollytelling
d3.select('#scatter-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html((d, i) => {
    const dateString = d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const linkText =
      i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious';

    const fileCount = d3.rollups(
      d.lines,
      (D) => D.length,
      (line) => line.file,
    ).length;

    return `
      On ${dateString},
      I made <a href="${d.url}" target="_blank">${linkText}</a>.
      I edited ${d.totalLines} lines across ${fileCount} files.
      Then I looked over all I had made, and I saw that it was very good.
    `;
  });

function onStepEnter(response) {
  // Commit associated with the step that crossed the midpoint
  const commit = response.element.__data__;

  // 1. Update "max time" to this commit's datetime
  commitMaxTime = commit.datetime;

  // 2. Get DOM elements we need
  const sliderEl = document.querySelector('#commit-progress');
  const timeEl  = document.querySelector('#commit-time');

  // 3. Keep slider in sync with scroll position
  //    (map date -> percentage using the same timeScale)
  commitProgress = timeScale(commitMaxTime);
  if (sliderEl) {
    sliderEl.value = commitProgress;
  }

  // 4. Update the text under the slider
  if (timeEl) {
    timeEl.textContent = commitMaxTime.toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  }

  // 5. Filter commits up to this time (same as onTimeSliderChange)
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);

  // 6. Update the visualizations
  updateScatterPlot(data, filteredCommits);
  updateFileDisplay(filteredCommits);
}

// Scrollama
const scroller = scrollama();

scroller
  .setup({
    container: '#scrolly-1',
    step: '#scrolly-1 .step',
  })
  .onStepEnter(onStepEnter);


renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

updateFileDisplay(filteredCommits);
onTimeSliderChange();



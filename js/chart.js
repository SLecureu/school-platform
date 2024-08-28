function render_chart_1() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("y", 100 - (1 / max_ratio) * 100 + 1 + "%");
  rect.setAttribute("x", "0");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "1px");
  rect.setAttribute("fill", "rgba(255, 255, 255, 0.15)");
  svg.appendChild(rect);

  const barWidth = (100 / ratio_evolution.length) * 2;
  let xPos = 0;

  for (let i = 0; i < ratio_evolution.length - 1; i += 2) {
    if (ratio_evolution[i] == "Infinity") {
      ratio_evolution[i] = max_ratio;
    } else if (ratio_evolution[i] == -Infinity) {
      ratio_evolution[i] = min_ratio;
    }

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let barHeight;
    let color = "#00D4A1";
    if (ratio_evolution[i] < 1) {
      color = "#E66A7D";
    }

    let yPos = 100 - (ratio_evolution[i] / max_ratio) * 100 + 1;

    if (i != ratio_evolution.length - 2) {
      barHeight =
        (ratio_evolution[i] / max_ratio) * 100 -
        (ratio_evolution[i - 2] / max_ratio) * 100;
      if (barHeight == 0) {
        barHeight = 2;
        yPos = 100 - (ratio_evolution[i] / max_ratio) * 100;
      } else if (barHeight < 0) {
        barHeight = -barHeight;
        yPos = 100 - (ratio_evolution[i] / max_ratio) * 100 - barHeight + 1;
      }
    }

    barHeight -= 1;

    rect.setAttribute("x", xPos + "%");
    rect.setAttribute("y", yPos + "%");
    rect.setAttribute("width", barWidth + "%");
    rect.setAttribute("height", barHeight + "%");
    rect.setAttribute("fill", color);

    rect.addEventListener("mouseover", function () {
      document
        .getElementById("chart1_date" + i)
        .setAttribute("visibility", "visible");
      document
        .getElementById("chart1_ratio_" + i)
        .setAttribute("visibility", "visible");
    });
    rect.addEventListener("mouseout", function () {
      document
        .getElementById("chart1_date" + i)
        .setAttribute("visibility", "hidden");
      document
        .getElementById("chart1_ratio_" + i)
        .setAttribute("visibility", "hidden");
    });

    svg.appendChild(rect);

    const text_date = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text_date.setAttribute("x", "40%");
    text_date.setAttribute("y", "98%");
    text_date.textContent = dateTimeFormat.format(
      new Date(ratio_evolution[i + 1])
    );
    text_date.setAttribute("id", "chart1_date" + i);
    text_date.setAttribute("visibility", "hidden");
    text_date.setAttribute("fill", "#B2ACB8");
    svg.appendChild(text_date);

    const text_ratio = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text_ratio.setAttribute("x", "40%");
    text_ratio.setAttribute("y", "93%");
    text_ratio.textContent = ratio_evolution[i];
    text_ratio.setAttribute("id", "chart1_ratio_" + i);
    text_ratio.setAttribute("visibility", "hidden");
    text_ratio.setAttribute("fill", "#D9D9D9");
    svg.appendChild(text_ratio);

    xPos += barWidth;
  }

  document.getElementById("chart1").appendChild(svg);
}

function render_chart_2() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const barWidth = 100 / div01_transaction.length;
  let [xPos, yPos, total] = [0, 0, 0];

  for (let i = 0; i < div01_transaction.length - 1; i++) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    total += div01_transaction[i].amount;

    const barHeight = yPos - (100 - (total / xp_div01) * 100 + 1) + 1;
    yPos = 100 - (total / xp_div01) * 100 + 1;

    rect.setAttribute("x", xPos + "%");
    rect.setAttribute("y", yPos + "%");
    rect.setAttribute("width", barWidth + "%");
    rect.setAttribute("height", barHeight + "%");
    rect.setAttribute("fill", "#B2ACB8");

    rect.addEventListener("mouseover", function () {
      document
        .getElementById("chart2_date" + i)
        .setAttribute("visibility", "visible");
      document
        .getElementById("chart2_ratio_" + i)
        .setAttribute("visibility", "visible");
    });
    rect.addEventListener("mouseout", function () {
      document
        .getElementById("chart2_date" + i)
        .setAttribute("visibility", "hidden");
      document
        .getElementById("chart2_ratio_" + i)
        .setAttribute("visibility", "hidden");
    });

    svg.appendChild(rect);

    const text_date = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text_date.setAttribute("x", "40%");
    text_date.setAttribute("y", "98%");
    text_date.textContent = dateTimeFormat.format(
      new Date(div01_transaction[i].createdAt)
    );
    text_date.setAttribute("id", "chart2_date" + i);
    text_date.setAttribute("visibility", "hidden");
    text_date.setAttribute("fill", "#B2ACB8");
    svg.appendChild(text_date);

    const text_ratio = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text_ratio.setAttribute("x", "40%");
    text_ratio.setAttribute("y", "93%");
    text_ratio.textContent =
      div01_transaction[i].object.name + " - " + xp_format(total);
    text_ratio.setAttribute("id", "chart2_ratio_" + i);
    text_ratio.setAttribute("visibility", "hidden");
    text_ratio.setAttribute("fill", "#D9D9D9");
    svg.appendChild(text_ratio);

    xPos += barWidth;
  }

  document.getElementById("chart2").appendChild(svg);
}

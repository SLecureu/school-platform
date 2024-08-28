let user;

let audit_done = 0;
let audit_received = 0;
let xp_piscine_go = 0;
let xp_div01 = 0;
let xp_piscine_js = 0;
let ratio = 0;
let max_ratio = 0;
let min_ratio = 0;

let ratio_evolution = [];
let audit_done_transaction = [];
let audit_received_transaction = [];
let piscine_go_transaction = [];
let div01_transaction = [];
let piscine_js_transaction = [];

const query1 = `
    {
user {
    id
    login
    attrs
}
}
`;

const query2 = `
{
    transaction(where: { userId: { _eq: 0 } }) {
    amount
    createdAt
    type
    object {
        name
        type
    }
    }
}
`;

const dateTimeFormat = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

async function get_user_data(username, password, query) {
  const credentials = `${username}:${password}`;
  const encodedCredentials = btoa(credentials);

  return fetch("https://zone01normandie.org/api/auth/signin", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
    },
  })
    .then((response) => {
      if (response.status != 200) {
        return Promise.reject(new Error("Status not 200"));
      }
      return response.json();
    })
    .then(async (data) => {
      return fetch(
        "https://zone01normandie.org/api/graphql-engine/v1/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data}`,
          },
          body: JSON.stringify({ query: query }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    })
    .catch((_) => {
      return "error";
    });
}

function update_max_ratio() {
  if (
    max_ratio < Math.round((audit_done / audit_received) * 10) / 10 &&
    Math.round((audit_done / audit_received) * 10) / 10 != Infinity
  ) {
    max_ratio = Math.round((audit_done / audit_received) * 10) / 10;
  }
}

function update_min_ratio() {
  if (
    min_ratio > Math.round((audit_done / audit_received) * 10) / 10 &&
    Math.round((audit_done / audit_received) * 10) / 10 != Infinity
  ) {
    min_ratio = Math.round((audit_done / audit_received) * 10) / 10;
  }
}

function update_ratio_evolution(data, date) {
  ratio_evolution.push(data, date);
}

async function asking() {
  let username = document.getElementById("username_login").value;
  let password = document.getElementById("password_login").value;

  return get_user_data(username, password, query1)
    .then((data) => {
      if (data === "error") {
        return Promise.reject(new Error("Error in authentification"));
      }

      user = data.data.user[0];
      return query2.replace("0", user.id);
    })
    .then(async (query) => {
      return get_user_data(username, password, query).then((data) => {
        data.data.transaction.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        data.data.transaction.forEach((data) => {
          switch (data.type) {
            case "up":
              audit_done += data.amount;
              audit_done_transaction.push(data);
              update_ratio_evolution(
                Math.round((audit_done / audit_received) * 10) / 10,
                data.createdAt
              );
              update_max_ratio();
              update_min_ratio();
              break;
            case "down":
              audit_received += data.amount;
              audit_received_transaction.push(data);
              update_ratio_evolution(
                Math.round((audit_done / audit_received) * 10) / 10,
                data.createdAt
              );
              update_max_ratio();
              update_min_ratio();
              break;
            case "xp":
              if (
                data.createdAt.substring(0, 7) === "2023-06" ||
                data.createdAt.substring(0, 7) === "2023-07"
              ) {
                xp_piscine_go += data.amount;
                piscine_go_transaction.push(data);
              } else if (
                data.createdAt.substring(0, 7) === "2024-05" &&
                (data.object.type === "raid" || data.object.type === "exercise")
              ) {
                xp_piscine_js += data.amount;
                piscine_js_transaction.push(data);
              } else {
                xp_div01 += data.amount;
                div01_transaction.push(data);
              }
          }
        });
        ratio = Math.round((audit_done / audit_received) * 10) / 10;
        return Promise.resolve();
      });
    })
    .then(() => {
      let login_page = document.getElementById("login_page");
      login_page.style.display = "none";

      let main_page = document.getElementById("main_page");
      main_page.style.display = "block";

      let logout = document.getElementById("logout");
      logout.style.display = "flex";

      let welcoming_txt = document.getElementById("welcoming_txt");
      welcoming_txt.innerHTML +=
        user.attrs.firstName + " " + user.attrs.lastName + "!";

      div01();

      let ratio_div = document.getElementById("ratio");
      ratio_div.innerHTML = ratio;

      if (audit_done >= audit_received) {
        let received_rod = document.getElementById("received_rod");
        received_rod.style.width = ratio * 100 + "%";
        ratio_div.style.color = "#00D4A1";
      } else {
        let done_rod = document.getElementById("done_rod");
        done_rod.style.width = ratio * 100 + "%";
        ratio_div.style.color = "#E66A7D";
      }

      let done = document.getElementById("done");
      done.innerHTML = xp_format(audit_done);

      let received = document.getElementById("received");
      received.innerHTML = xp_format(audit_received);

      let i = audit_done_transaction.length - 3;
      while (i < audit_done_transaction.length) {
        load_audits(audit_done_transaction[i], "audits_done");
        i++;
      }

      i = audit_received_transaction.length - 3;
      while (i < audit_received_transaction.length) {
        load_audits(audit_received_transaction[i], "audits_received");
        i++;
      }

      render_chart_1();
      render_chart_2();
    })
    .catch((error) => {
      document.getElementById("password_error").style.display = "block";
      throw error;
    });
}

function load_activity(object) {
  let activity = document.getElementById("activity");

  let transaction = document.createElement("div");
  transaction.className = "transaction";

  let type = document.createElement("span");
  type.className = "type";
  type.innerHTML = object.object.type;

  let name = document.createElement("span");
  name.className = "name";
  name.innerHTML = object.object.name;

  let xp = document.createElement("span");
  xp.className = "xp";
  xp.innerHTML = xp_format(object.amount);

  transaction.append(type, "-", name, xp);
  activity.prepend(transaction);
}

function load_audits(object, position) {
  let audits = document.getElementById(position);

  let transaction = document.createElement("div");
  transaction.className = "transaction";

  let type = document.createElement("span");
  type.className = "type";
  type.innerHTML = object.object.type;

  let name = document.createElement("span");
  name.className = "name";
  name.innerHTML = object.object.name;

  let xp = document.createElement("span");
  xp.className = "xp";
  xp.innerHTML = xp_format(object.amount);

  transaction.append(type, "-", name, xp);
  audits.prepend(transaction);
}

function xp_format(xp) {
  let unity = " B";
  let number = xp;
  if (xp >= 1000) {
    number = xp / 1000;
    unity = " kB";
  }
  if (number >= 1000) {
    number = number / 1000;
    unity = " MB";
  }
  return number.toFixed(2) + unity;
}

function remove_all_but_last(DivName) {
  const Div = document.getElementById(DivName);

  while (Div.children.length > 1) {
    Div.removeChild(Div.firstChild);
  }
}

function remove_all_but_first(DivName) {
  const Div = document.getElementById(DivName);

  while (Div.children.length > 1) {
    Div.removeChild(Div.lastChild);
  }
}

function div01() {
  let formated_xp = xp_format(xp_div01);
  let xp_dom = document.getElementById("xp");
  xp_dom.innerHTML = formated_xp;

  let category = document.getElementById("category");
  category.innerHTML = "Div 01";

  let see_more_transaction = document.getElementById("see_more_transaction");
  see_more_transaction.onclick = function () {
    load_transaction_page("div01");
  };

  remove_all_but_last("activity");

  let i = div01_transaction.length - 4;
  while (i < div01_transaction.length) {
    load_activity(div01_transaction[i]);
    i++;
  }
}

function piscine_go() {
  let formated_xp = xp_format(xp_piscine_go);
  let xp_dom = document.getElementById("xp");
  xp_dom.innerHTML = formated_xp;

  let category = document.getElementById("category");
  category.innerHTML = "Piscine go";

  let see_more_transaction = document.getElementById("see_more_transaction");
  see_more_transaction.onclick = function () {
    load_transaction_page("piscine_go");
  };

  remove_all_but_last("activity");

  let i = piscine_go_transaction.length - 4;
  while (i < piscine_go_transaction.length) {
    load_activity(piscine_go_transaction[i]);
    i++;
  }
}

function piscine_js() {
  let formated_xp = xp_format(xp_piscine_js);
  let xp_dom = document.getElementById("xp");
  xp_dom.innerHTML = formated_xp;

  let category = document.getElementById("category");
  category.innerHTML = "Piscine js";

  let see_more_transaction = document.getElementById("see_more_transaction");
  see_more_transaction.onclick = function () {
    load_transaction_page("piscine_js");
  };

  remove_all_but_last("activity");

  let i = piscine_js_transaction.length - 4;
  while (i < piscine_js_transaction.length) {
    load_activity(piscine_js_transaction[i]);
    i++;
  }
}

function load_transaction_page(transaction_name) {
  remove_all_but_first("transaction_page");

  let main_page = document.getElementById("main_page");
  main_page.style.display = "none";

  let transaction_page = document.getElementById("transaction_page");
  transaction_page.style.display = "block";

  let temp_transaction = [];

  switch (transaction_name) {
    case "div01": {
      temp_transaction = div01_transaction;
      break;
    }
    case "piscine_go": {
      temp_transaction = piscine_go_transaction;
      break;
    }
    case "piscine_js": {
      temp_transaction = piscine_js_transaction;
      break;
    }
    case "audits_done": {
      temp_transaction = audit_done_transaction;
      break;
    }
    case "audits_received": {
      temp_transaction = audit_received_transaction;
    }
  }

  for (let i = temp_transaction.length - 1; i >= 0; i--) {
    let single_transaction = document.createElement("div");
    single_transaction.className = "single_transaction";

    let name_type = document.createElement("div");
    name_type.className = "name_type";

    let type_ = document.createElement("span");
    type_.innerHTML = temp_transaction[i].object.type;

    let name_ = document.createElement("span");
    name_.innerHTML = temp_transaction[i].object.name;

    name_type.append(type_, "-", name_);

    let xp_ = document.createElement("div");
    xp_.innerHTML = xp_format(temp_transaction[i].amount);

    let date = document.createElement("div");
    date.innerHTML = dateTimeFormat.format(
      new Date(temp_transaction[i].createdAt)
    );
    date.className = "date";

    single_transaction.append(name_type, xp_, date);
    transaction_page.append(single_transaction);
  }
}

function load_main_page() {
  let main_page = document.getElementById("main_page");
  main_page.style.display = "block";

  let transaction_page = document.getElementById("transaction_page");
  transaction_page.style.display = "none";
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    let login_page = document.getElementById("login_page");
    if (login_page.style.display != "none") {
      asking();
    }
  }
});

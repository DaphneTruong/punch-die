// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOM is fully loaded and parsed!');
//     // You can now safely manipulate DOM elements, add event listeners, etc.
// });

const input_form = document.getElementById("input-form");
let done_items = [];
input_form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission
  document.getElementById("result-list").innerHTML = "";
  const formData = new FormData(input_form);
  let order_id_list = [];

  try {
    for (let i = 1; i <= 25; i++) {
      const id_value = formData.get(`id-${i}`)
        ? formData.get(`id-${i}`).trim()
        : "";
      const order_value = formData.get(`order-${i}`)
        ? formData.get(`order-${i}`).trim()
        : "";
      const input_object = {
        id: id_value,
        order: order_value,
      };

      if (id_value && id_value.length < 4) {
        alert(`${id_value} must be at least 4 characters long.`);
        return;
      }
      if (id_value && id_value !== "") {
        order_id_list.push(input_object);
      }
    }
    let object_array = sorting(order_id_list, data);
    object_array = assignColors(object_array);
    writingResults(object_array);
  } catch (error) {
    console.error("Error:", error);
  }
});

function sorting(order_ids, data) {
  const items_array = [];
  if (order_ids.length > 0) {
    order_ids.forEach((object) => {
      const item_object = searchById(object, data);
      items_array.push(...item_object);
    });
  }
  const sorted_array = [...items_array].sort((a, b) => {
    if (a.punch === b.punch && a.die === b.die) {
      return a.name.localeCompare(b.name); // optional tie-break by name
    }

    return a.punch.localeCompare(b.punch);
  });
  const moved_array = moveToEnd(sorted_array);
  return moved_array;
}

function searchById(order_id, data) {
  let length = 4; // start with last 4 digits
  let matches;
  const input_id = order_id.id;

  if (input_id.length === length) {
    // Find all objects whose id ends with that suffix
    matches = data.filter((item) => {
      return item.id.endsWith(input_id);
    });

    if (!matches || matches.length === 0) {
      return [createNotFoundItem(input_id, order_id.order)];
    }
    if (matches.length === 1) {
      matches[0].order = order_id.order;
    } else {
      matches.forEach((item) => {
        item.order = order_id.order;
      });
    }
    return matches;
  } else {
    while (input_id.length > length) {
      // Take substring of targetId (last "length" digits)
      const suffix = input_id.slice(-length);

      // Find all objects whose id ends with that suffix
      matches = data.filter((item) => {
        item.order = order_id.order;
        return item.id.endsWith(suffix);
      });

      if (matches.length === 1) {
        matches[0].order = order_id.order;
        return matches; // found a unique match
      } else {
        matches.forEach((item) => {
          item.order = order_id.order;
        });
      }

      length++; // increase length and try again
    }
    return [createNotFoundItem(input_id, order_id.order)]; // no match found
  }
}

function writingResults(results) {
  const result_list = document.getElementById("result-list");

  if (results.length > 0) {
    results.forEach((object) => {
      /**
       * Architecture of each result item
       * <div class="result-item">
       *   <img class="item-image" src="images/1234.png" alt="Item Name">
       *   <div class="name-div">Item Name</div>
       *   <div class="order-id">
       *     <div class="order-number">#OrderNumber</div>
       *      <div class="id-div">ItemID</div>
       *   </div>
       *   <div class="punch-die">
       *     <div class="punch">P: PunchValue</div>
       *     <div class="die">D: DieValue</div>
       *   </div>
       * </div>
       */

      const image_path = `images/${object.id}.png`;
      const result_item = document.createElement("div");
      result_item.setAttribute("id", `result-item-${object.id}`);
      result_item.classList.add("result-item");

      /** Image block */
      const item_img = document.createElement("img");
      item_img.classList.add("item-image");
      item_img.setAttribute("id", `item-image-${object.id}`);
      item_img.src = image_path;
      item_img.alt = object.name;
      /*----------------------------*/

      /** Name and done button block */
      const name_butt = document.createElement("div");
      name_butt.classList.add("name-butt");
      name_butt.setAttribute("id", `name-butt-${object.id}`);

      const name_div = document.createElement("div");
      name_div.classList.add("name-div");
      name_div.textContent = object.name;

      const done_button = document.createElement("div");
      done_button.classList.add("done-button");
      done_button.setAttribute("id", `done-button-${object.id}`);
      done_button.textContent = "Done";

      name_butt.appendChild(name_div);
      name_butt.appendChild(done_button);
      /*----------------------------*/

      /** Order number and Id number block */
      const order_id = document.createElement("div");
      order_id.classList.add("order-id");
      const order_number = document.createElement("div");
      order_number.classList.add("order-number");
      order_number.textContent = object.order;
      const id_div = document.createElement("div");
      id_div.classList.add("name-div");
      id_div.textContent = object.id;
      order_id.appendChild(order_number);
      order_id.appendChild(id_div);
      /*----------------------------*/

      /* Punch and Die block*/
      const punch_die = document.createElement("div");
      punch_die.classList.add("punch-die");
      const punch = document.createElement("div");
      punch.classList.add("punch");
      punch.textContent = `P: ${object.punch}`;
      const die = document.createElement("div");
      die.classList.add("die");
      die.textContent = `D: ${object.die}`;
      punch_die.appendChild(punch);
      punch_die.appendChild(die);
      /*----------------------------*/

      /* Assign colors*/
      punch.classList.add(object.punchColor);
      die.classList.add(object.dieColor);

      /* Append all to result item div*/
      result_item.appendChild(item_img);
      result_item.appendChild(name_butt);
      result_item.appendChild(order_id);
      result_item.appendChild(punch_die);
      /*----------------------------*/

      /* Append result item to result list */
      result_list.appendChild(result_item);

      const loaded_done_button = document.getElementById(
        `done-button-${object.id}`
      );
      loaded_done_button.addEventListener("click", function (e) {
        addDoneItem(object);
      });
    });
    return;
  } else {
    result_list.innerHTML = "No matching results found.";
  }
}

// Function to assign colors
function assignColors(object_array) {
  let punchIndex = 0;
  let dieIndex = 0;

  const punchMap = new Map();
  const dieMap = new Map();

  return object_array.map((item) => {
    // Assign punch color
    if (punchMap.has(item.punch)) {
      item.punchColor = punchMap.get(item.punch);
    } else {
      const color = colors[punchIndex % colors.length];
      punchMap.set(item.punch, color);
      item.punchColor = color;
      punchIndex++;
    }

    // Assign die color
    if (dieMap.has(item.die)) {
      item.dieColor = dieMap.get(item.die);
    } else {
      const color = colors[dieIndex % colors.length];
      dieMap.set(item.die, color);
      item.dieColor = color;
      dieIndex++;
    }

    return item;
  });
}

function createNotFoundItem(id, order_number) {
  return {
    order: order_number,
    name: "No match found",
    id: id,
    punch: "N/A",
    die: "N/A",
    note: "N/A",
  };
}

function addDoneItem(item) {
  console.log('done_items in add before', done_items);
  const done_item = document.getElementById(`result-item-${item.id}`);
  const done_button = document.getElementById(`done-button-${item.id}`);
  let un_done_button = document.getElementById(`un-done-button-${item.id}`);
  const name_butt = document.getElementById(`name-butt-${item.id}`);
  if (done_item) {
    done_item.classList.add("done-item");
    done_items.push(item);
  } else {
    console.error("Element not found.");
  }
  addClass(done_button, "hidden");
  
  if (!un_done_button) {
    un_done_button = document.createElement("div");
    un_done_button.classList.add("un-done-button");
    un_done_button.setAttribute("id", `un-done-button-${item.id}`);
    un_done_button.textContent = "Undone";
    name_butt.appendChild(un_done_button);
  }else{
    removeClass(un_done_button, "hidden");
  }
  
  // Add event listener to the new un-done button
  const loaded_un_done_button = document.getElementById(
    `un-done-button-${item.id}`
  );
  loaded_un_done_button.addEventListener("click", function (e) {
    done_item.classList.remove("done-item");
    removeDoneItem(item);
  });
  
  console.log('done_items in add', done_items);
}

/* Function to remove done item */
function removeDoneItem(item) {
  console.log('done_items in remove before', done_items);
  console.log('Removing item:', item);
  // unmark the item visually
  const done_item = document.getElementById(`result-item-${item.id}`);
  removeClass(done_item, "done-item");

  // show done button, hide un-done button
  const done_button = document.getElementById(`done-button-${item.id}`);
  removeClass(done_button, "hidden");
  const un_done_button = document.getElementById(`un-done-button-${item.id}`);
  addClass(un_done_button, "hidden");

  // remove from done_items array
  done_items = done_items.filter((i) => i.id !== item.id);
  console.log('done_items in remove after', done_items);
}

/* Move all "No match found" items to the end of the array */
function moveToEnd(item_array) {
  return [
    ...item_array.filter((item) => item.name !== "No match found"), // keep everything else
    ...item_array.filter((item) => item.name === "No match found"), // then add the moved ones
  ];
}

function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  } else {
    console.error("Element not found.");
  }
}

function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  } else {
    console.error("Element not found.");
  }
}

function print() {
  printSpecificElement(done_items);
}

function printSpecificElement(done_items) {
  const elementToPrint = document.getElementById("print-area");
  if (!elementToPrint) return;
  const date_time = new Date();
  const date_string = date_time.toLocaleDateString();
  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>Print</title>");
  // Include your print-specific CSS here
  printWindow.document.write(
    '<link rel="stylesheet" type="text/css" media="print" href="print.css">'
  );
  printWindow.document.write("<div id='container'>"); //container div
  printWindow.document.write("<div id='name' style='margin: 5px auto;'>Name: ____________________</div>"); //name div

  printWindow.document.write("<div id='machine' style='margin: 5px auto;'>Machine Name: ____________________</div>"); //machine div

  printWindow.document.write(`<div id='date' style='margin: 5px auto;'>Date: ${date_string}</div>`); //date div

  printWindow.document.write("<div id='results'>"); //results div
  if (done_items.length > 0) {
    done_items.forEach((object,index) => {
      printWindow.document.write("<div class='result-item'>");

      printWindow.document.write(
        `<div style="font-size: 1.1em;">${index + 1}/  ${object.order} - ${object.id}</div>`
      );
      printWindow.document.write("</div>"); //close result-item div
    });
  } else {
    printWindow.document.write("No items marked as done.");
  }
  printWindow.document.write("</div>"); //close results div
  
  printWindow.document.write("<div>Comments: </div>"); //comments div
  printWindow.document.write("</div>"); //close container div
  printWindow.document.write("</head><body>");
  printWindow.document.write(elementToPrint.innerHTML);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}


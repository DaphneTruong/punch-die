// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOM is fully loaded and parsed!');
//     // You can now safely manipulate DOM elements, add event listeners, etc.
// });

/*
function checkDataIssues(data) {
    const seen = new Set();
    const duplicates = new Set();
    const missingImages = [];

    // 1. Check for duplicate IDs
    for (const item of data) {
        if (seen.has(item.id)) {
            duplicates.add(item.id);
        } else {
            seen.add(item.id);
        }
    }

    // 2. Check for missing images
    const checks = data.map(item => {
        return new Promise(resolve => {
            const img = new Image();
            img.src = `images/${item.id}.png`;
            img.onload = () => resolve(null);          // image exists
            img.onerror = () => resolve(item.id);      // image missing
        });
    });

    return Promise.all(checks).then(results => {
        results.forEach(r => {
            if (r) missingImages.push(r);
        });

        return {
            duplicates: Array.from(duplicates),
            missingImages
        };
    });
}

// Usage
checkDataIssues(data).then(result => {
    if (result.duplicates.length > 0) {
        console.log("Duplicate IDs found:", result.duplicates);
    } else {
        console.log("No duplicate IDs.");
    }

    if (result.missingImages.length > 0) {
        console.log("Missing images:", result.missingImages);
    } else {
        console.log("All images found.");
    }
});

//************END OF DATA CHECKING************************
*/


const input_form = document.getElementById("input-form");

let done_items = [];
/** Submit function*/
input_form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission
  document.getElementById("result-list").innerHTML = "";
  let working_list = [];
  const formData = new FormData(input_form);
    console.log('done_items: ', done_items)
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

      //if (id_value && id_value.length < 4) {
      //  alert(`${id_value} must be at least 4 characters long.`);
      //  return;
      //}
        if (id_value && id_value !== "") {
          working_list.push(input_object);
      }
    }
    let object_array = sorting(working_list, data);
    object_array = assignColors(object_array);
    writingResults(object_array);
      if (done_items && done_items.length > 0) {
        done_items.forEach(function (item) {
          const id = removeDash(item.id)
          const done_item = document.getElementById(`result-item-${id}-${item.order}`);
            const result_item = document.getElementById(`result-item-${id}-${item.order}`);
            if (result_item) result_item.classList.add('done-item');

          const done_button = document.getElementById(`done-button-${id}-${item.order}`);
            if (done_button) done_button.classList.add('hidden');

          const name_button = document.getElementById(`name-butt-${id}-${item.order}`);
          if (name_button) createUndoneButton(`${id}-${item.order}`, name_button);
          // Add event listener to the new un-done button
          const loaded_un_done_button = document.getElementById(
            `un-done-button-${id}-${item.order}`
          );
          loaded_un_done_button.addEventListener("click", function (e) {
            done_item.classList.remove("done-item");
            removeDoneItem(item);
          });
        })
    }
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
    // First compare punch
    if (a.punch < b.punch) return -1;
    if (a.punch > b.punch) return 1;

    // If punch is the same, compare die
    if (a.die < b.die) return -1;
    if (a.die > b.die) return 1;

    // If both punch and die are same, keep order stable
    return 0;
  });
  const moved_array = moveToEnd(sorted_array);
  return moved_array;
}

function searchById(order_id, data) {
    let match = [];

    original_order_id = { ...order_id };
    input_id = original_order_id.id;

    //Remove dash in id to lookup into the data
    const lookup_id = String(order_id.id).replace(/-/g, "").toUpperCase() ;

    match = data.find(item => item.id === lookup_id);
    if (match) {
        return [{...match, order: order_id.order, id:input_id }];
    };
    // not found — keep your existing creator for "not found"
    return [createNotFoundItem(input_id, order_id.order)];
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
      const id = removeDash(object.id);

        const image_path = `images/${id}.png`;
        const result_item = document.createElement("div");
        result_item.setAttribute("id", `result-item-${id}-${object.order}`);
        result_item.classList.add("result-item");

        /** Image block */
        const item_img = document.createElement("img");
        item_img.classList.add("item-image");
        item_img.setAttribute("id", `item-image-${id}-${object.order}`);
        item_img.src = image_path;
        item_img.alt = object.name;
      /*----------------------------*/

      /** Name and done button block */
      const name_butt = document.createElement("div");
      name_butt.classList.add("name-butt");
      name_butt.setAttribute("id", `name-butt-${id}-${object.order}`);

      const name_div = document.createElement("div");
      name_div.classList.add("name-div");
      name_div.textContent = object.name;

      const done_button = document.createElement("div");
      done_button.classList.add("done-button");
      done_button.setAttribute("id", `done-button-${id}-${object.order}`);
      done_button.textContent = "✓";

      name_butt.appendChild(name_div);
      name_butt.appendChild(done_button);
      /*----------------------------*/

      /** Order number and Id number block */
      
        const id_div = document.createElement("div");
        id_div.classList.add("id-div");
        id_div.textContent = object.id;
      /*----------------------------*/

        /** Order number and Id number block */
        const order_number = document.createElement("div");
        order_number.classList.add("order-number");
        order_number.textContent = object.order;
        /*----------------------------*/

        const punch_die = document.createElement("div");
        punch_die.classList.add("punch-die");
        const punch = document.createElement("div");
        punch.classList.add("punch");
        punch.textContent = `${object.punch}`;
        const die = document.createElement("div");
        die.classList.add("die");
        die.textContent = `${object.die}`;
        punch_die.appendChild(punch);
        punch_die.appendChild(die);

        //punch_die.style.position = "relative";
        //punch_die.style.top = "-25px";
        punch.style.position = "relative";
        punch.style.right = "-200px";
        punch.style.top = "-50px";

        die.style.position = "relative";
        die.style.top = "-25px";

      /* Punch and Die block*/
      //const punch_die = document.createElement("div");
      //punch_die.classList.add("punch-die");
      //const punch = document.createElement("div");
      //punch.classList.add("punch");
      //punch.textContent = `${object.punch}`;
      //const die = document.createElement("div");
      //die.classList.add("die");
      //die.textContent = `${object.die}`;
      //punch_die.appendChild(punch);
      //punch_die.appendChild(die);
      /*----------------------------*/

      /* Assign colors*/
      punch.classList.add(object.punchColor);
      die.classList.add(object.dieColor);

      /* Append all to result item div*/
      result_item.appendChild(item_img);
      result_item.appendChild(name_butt);
      result_item.appendChild(id_div);
      result_item.appendChild(order_number);
      result_item.appendChild(punch_die);
      /*----------------------------*/

      /* Append result item to result list */
      result_list.appendChild(result_item);

      const loaded_done_button = document.getElementById(
        `done-button-${id}-${object.order}`
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

    // Count occurrences of punch and die
    const punch_counts = {};
    const die_counts = {};

    object_array.forEach(item => {
        punch_counts[item.punch] = (punch_counts[item.punch] || 0) + 1;
        die_counts[item.die] = (die_counts[item.die] || 0) + 1;
    });

    // Maps to store group → assigned color
    const punchColorMap = {};
    const dieColorMap = {};

    let punchColorIndex = 0;
    let dieColorIndex = 0;

    object_array.forEach(item => {
        // Punch colors
        if (punch_counts[item.punch] === 1) {
            punchColorMap[item.punch] = "black";
        } else if (!punchColorMap[item.punch]) {
            punchColorMap[item.punch] = punchColors[punchColorIndex % punchColors.length];
            punchColorIndex++;
        }

        // Die colors
        if (die_counts[item.die] === 1) {
            dieColorMap[item.die] = "black";
        } else if (!dieColorMap[item.die]) {
            dieColorMap[item.die] = dieColors[dieColorIndex % dieColors.length];
            dieColorIndex++;
        }
    });

    // Return new data with added color fields
    return object_array.map(item => ({
        ...item,
        punchColor: punchColorMap[item.punch],
        dieColor: dieColorMap[item.die],
    }));

  //let punchIndex = 0;
  //let dieIndex = 0;

  //const punchMap = new Map();
  //const dieMap = new Map();

  //  return object_array.map((item) => {
  //  // Assign punch color
  //  if (punchMap.has(item.punch)) {
  //    item.punchColor = punchMap.get(item.punch);
  //  } else {
  //    const color = punchColors[punchIndex % punchColors.length];
  //    punchMap.set(item.punch, color);
  //    item.punchColor = color;
  //    punchIndex++;
  //  }

  //  // Assign die color
  //  if (dieMap.has(item.die)) {
  //    item.dieColor = dieMap.get(item.die);
  //  } else {
  //    const color = dieColors[dieIndex % dieColors.length];
  //    dieMap.set(item.die, color);
  //    item.dieColor = color;
  //    dieIndex++;
  //      }; 
  //  return item;
  //});
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
  const id = removeDash(item.id);
  const done_item = document.getElementById(`result-item-${id}-${item.order}`);
  const done_button = document.getElementById(`done-button-${id}-${item.order}`);
  const un_done_button = document.getElementById(`un-done-button-${id}-${item.order}`);
  const name_butt = document.getElementById(`name-butt-${id}-${item.order}`);
  if (done_item) {
      done_item.classList.add("done-item");
    done_items.push(item);
  } else {
    console.error("Element not found.");
  }
  addClass(done_button, "hidden");
 
  if (!un_done_button) {
    createUndoneButton(`${id}-${item.order}`, name_butt)
  }else{
    removeClass(un_done_button, "hidden");
  }
  
  // Add event listener to the new un-done button
  const loaded_un_done_button = document.getElementById(
    `un-done-button-${id}-${item.order}`
  );
  loaded_un_done_button.addEventListener("click", function (e) {
    done_item.classList.remove("done-item");
    removeDoneItem(item);
  });
}

function createUndoneButton(id, parent_element) {
    un_done_button = document.createElement("div");
    un_done_button.classList.add("un-done-button");
    un_done_button.setAttribute("id", `un-done-button-${id}`);
    un_done_button.textContent = "x";
    parent_element.appendChild(un_done_button);
}

/* Function to remove done item */
function removeDoneItem(item) {
  console.log('undone click')
  const id = removeDash(item.id);
  // unmark the item visually
  const done_item = document.getElementById(`result-item-${id}-${item.order}`);
  removeClass(done_item, "done-item");

  // show done button, hide un-done button
  const done_button = document.getElementById(`done-button-${id}-${item.order}`);
  removeClass(done_button, "hidden");
  const un_done_button = document.getElementById(`un-done-button-${id}-${item.order}`);
  addClass(un_done_button, "hidden");

  const done_image = document.getElementById(`done-image-${id}-${item.order}`);
  addClass(done_image, "hidden");
  const item_image = document.getElementById(`item-image-${id}-${item.order}`);
  removeClass(item_image, "hidden");


  // remove from done_items array
  done_items = done_items.filter((i) => i.id !== item.id);
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

function removeDash(id) {
  return String(id).replace(/-/g, "").toUpperCase()
}

/** Print function - Is called from frontend print button */
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

  printWindow.document.write("<div id='container'>"); //container div
    printWindow.document.write("<div id='name' style='margin: 5px auto;'>Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: _______________________</div>"); //name div

    printWindow.document.write("<div id='machine' style='margin: 5px auto;'>Machine&nbsp;&nbsp;: _______________________</div>"); //machine div

    printWindow.document.write(`<div id='date' style='margin: 5px auto;'>Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: &nbsp;&nbsp;&nbsp;&nbsp;${date_string}</div>`); //date div
  printWindow.document.write(`<br>`); //empty line

  printWindow.document.write("<div id='results'>"); //results div
  if (done_items.length > 0) {
      done_items.forEach((object, index) => {
        let orderName = object.order;
          orderName = orderName.padEnd(20, " ");
          // Replace spaces with &nbsp;
          orderName = orderName.replace(/ /g, "&nbsp;");
      printWindow.document.write("<div class='result-item'>");
        
        if (index < 9) {
          printWindow.document.write(
            `<div style="font-size: 1.1em;">
               &nbsp;&nbsp;&nbsp;&nbsp;0${index + 1}.&nbsp;&nbsp;${orderName}|&nbsp;&nbsp;&nbsp;&nbsp; ${object.id}
             </div>`
          );
        } else {
          printWindow.document.write(
            `<div style="font-size: 1.1em;">
               &nbsp;&nbsp;&nbsp;&nbsp;${index + 1}.&nbsp;&nbsp;${orderName}|&nbsp;&nbsp;&nbsp;&nbsp; ${object.id}
             </div>`
          );
        }

      printWindow.document.write("</div>"); //close result-item div
    });
  } else {
    printWindow.document.write("No items marked as done.");
  }
  printWindow.document.write("</div>"); //close results div

  printWindow.document.write(`<br>`); //empty line

  printWindow.document.write("<div>NOTES: </div>"); //comments div
  printWindow.document.write("</div>"); //close container div
  printWindow.document.write("</head><body>");
  printWindow.document.write(elementToPrint.innerHTML);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();

    
}


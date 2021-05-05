<?php
$mysqli = new mysqli("localhost", "postgres", "abc", "restaurant");
if($mysqli->connect_error) {
  exit('Could not connect');
}

$sql = "SELECT customerid, companyname, contactname, address, city, postalcode, country
FROM customers WHERE customerid = ?";

$sql = "select table_id from table_reservation,reservation 
where reservation.reservation_id=table_reservation.reservation_id and reservation.reservation_date='?' and slot_num=?;" 

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("si", $_GET['s1'],$_GET['i1']);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($table_arr);
$stmt->fetch();
$stmt->close();

echo "<div class="div-table">"
// echo"         <% for(var i=0; i < Math.floor(tables.length/6)+1; i++) { %>  "
for ($x = 0; $x < $_GET['floored_i']; $x++){
    echo "<div class="div-table-row">"
            //   <% for(var j=0; j < Math.min(tables.length-6*i,6); j++) { %>       
            for($y = 0; $y < $_GET['min_j']; $y++){
              echo "<div class="div-table-col">"
                // <% if(tables[6*i+j].avl){ %>
                    echo "lol"
                echo "</div>"
            //     <input type="checkbox" id="check<%= 5*i+j %>" name="checkbox_arr" />
            //     <% } %>
            //     <% if(!tables[6*i+j].avl){ %>
            //     <input type="checkbox" id="check<%= 5*i+j %>" disabled="disabled" name="checkbox_arr" />
            //     <input type="hidden" name="checkbox_arr" value="-1" />
            //     <% } %>
            //     <label>
            //       <%if(tables[6*i+j].avl){ %> 
            //       <div class="myDIV"><img onclick="selectcheck(<%= 6*i+j %>)" class="table_img" src="./table_icon.jpg" width="80"><p>Table <%= 6*i+j+1 %></p></div>
            //       <% } %>
            //       <%if(!tables[6*i+j].avl){ %> 
            //       <div class="myDIV"><img onclick="selectcheck(<%= 6*i+j %>)" class="table_img" src="./taken_table.jpg" width="80"><p>Table <%= 6*i+j+1 %></p></div>
            //       <% } %>
            //       <div class="hide">Capacity: <%= tables[6*i+j].capacity %><br> <%if(tables[6*i+j].avl){%> un<% } %>occupied</div>
            //     </label>
            //   </div>
            }
       echo "</div>"
}     
            

echo       "</div>"
echo       "<div>Number of free tables: $_GET['free_num2'] </div>"
// echo "<table>";
// echo "<tr>";
// echo "<th>CustomerID</th>";
// echo "<td>" . $cid . "</td>";
// echo "<th>CompanyName</th>";
// echo "<td>" . $cname . "</td>";
// echo "<th>ContactName</th>";
// echo "<td>" . $name . "</td>";
// echo "<th>Address</th>";
// echo "<td>" . $adr . "</td>";
// echo "<th>City</th>";
// echo "<td>" . $city . "</td>";
// echo "<th>PostalCode</th>";
// echo "<td>" . $pcode . "</td>";
// echo "<th>Country</th>";
// echo "<td>" . $country . "</td>";
// echo "</tr>";
// echo "</table>";
?>
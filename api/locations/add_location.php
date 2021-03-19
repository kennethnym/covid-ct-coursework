<?php
include $_SERVER['DOCUMENT_ROOT'] . '/src/loader.php';
include $_SERVER['DOCUMENT_ROOT'] . '/src/db/db.php';
include '../response.php';
include '../error.php';

use api\Response;
use db\DB;

function add_location()
{
  $SERVER_ERROR_MESSAGE = "An error occurred when recording visit details.";

  $username = $_SESSION['username'];
  $duration = $_POST['duration'];
  $visit_date = $_POST['visitDate'];
  $location_x = $_POST['x'];
  $location_y = $_POST['y'];

  $db = DB::get_instance();

  $query_string = file_get_contents('sql/add_location.sql');
  $query = $db->prepare($query_string);
  $query->bind_param('ssiii', $username, strval($visit_date), $duration, $location_x, $location_y);

  $is_query_successful = $query->execute();

  if (!$is_query_successful) {
    Response::raise_internal_error($SERVER_ERROR_MESSAGE);
    return;
  }

  $result = $query->get_result();

  if (!$result || $db->affected_rows != 1) {
    Response::raise_internal_error($SERVER_ERROR_MESSAGE);
    return;
  }

  Response::success();
}

<?php

require $_SERVER['DOCUMENT_ROOT'] . '/src/loader.php';
require '../error.php';

use api\Response;

load_env();
session_start();

switch ($_SERVER['REQUEST_METHOD']) {
  case 'GET':
    require('get_locations.php');
    get_locations();
    break;

  case 'POST':
    require('add_location.php');
    add_location();
    break;

  default:
    Response::raise_unsupported_method_error();
    break;
}

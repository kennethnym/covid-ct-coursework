<?php

require('cookies.php');

function save_login(array $user, int $expiration)
{
  global $IS_LOGGED_IN;

  setcookie($IS_LOGGED_IN, true, $expiration, '/');
  session_start();
  $_SESSION['username'] = $user['username'];
}
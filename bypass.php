<?php
function adminer_object() {
    include_once "plugins/login-sqlite.php";

    class NoAuthSqlite extends Adminer {
        function login($login, $password) {
            return true;
        }
    }

    return new NoAuthSqlite;
}

include "adminer.php";

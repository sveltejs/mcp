<?php
function adminer_object() {
    include_once "plugins/login-sqlite.php";

    class NoAuthSqlite extends Adminer {
        function login($login, $password) {
            return true;
        }

        function credentials() {
            return array('/tmp/test.db', '', '');
        }

        function database() {
            return '/tmp/test.db';
        }

        function loginForm() {
            echo '<input type="hidden" name="auth[driver]" value="sqlite">';
            echo '<input type="hidden" name="auth[server]" value="/tmp/test.db">';
            echo '<input type="hidden" name="auth[username]" value="">';
            echo '<input type="hidden" name="auth[password]" value="">';
            echo '<input type="hidden" name="auth[db]" value="/tmp/test.db">';
            echo '<p>Connecting to SQLite database...</p>';
            echo '<script>document.forms[0].submit();</script>';
        }
    }

    return new NoAuthSqlite;
}

include "adminer.php";
<?php


require '../../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->load();

$debug          = $_ENV['APP_DEBUG'];

$clientID       = $_ENV['CLIENT_ID'];
$clientSecret   = $_ENV['CLIENT_SECRET'];

if ($debug == "yes") {
    $providerUrl = $_ENV['SANDBOX_AUTHENTICATION_PROVIDER_URL'];
    $websiteUrl = $_ENV['SANDBOX_WEBSITE_URL'];
} else {
    $providerUrl = $_ENV['AUTHENTICATION_PROVIDER_URL'];
    $websiteUrl = $_ENV['WEBSITE_URL'];
}

/*
 *
 * Settings production:
 * This is the file config.php, containing the configuration of the API.
 *
 * clientId: The client identification of your app, supplied by Binck (App Key)
 * clientSecret: The secret which gives access to the API (App Secret)
 * redirectUrl: The URL of your app, which is used to redirect after both a successful or unsuccessful login
 *
 */

// Configuration for Sandbox:
$configuration = json_decode(
    '{
        "clientId": "' . $clientID . '",
        "clientSecret": "' . $clientSecret . '",
        "redirectUrl": "http://localhost/binck",
        "authenticationProviderUrl": "' . $providerUrl . '",
        "apiUrl": "https://api.sandbox.binck.com/api/v1",
        "streamerUrl": "https://realtime.sandbox.binck.com/stream/v1",
        "websiteUrl": "' . $websiteUrl . '"
    }'
);

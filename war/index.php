<?php

error_reporting(E_ALL);

ob_start();
require_once("page.php");
$page = ob_get_contents();
ob_end_clean();



$xml = <<<XML
<?xml version="1.0" encoding="UTF-8" ?>
<Module>
<!-- Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License
-->
	<ModulePrefs title="Hangouts War">
		<Require feature="rpc" />
		<Require feature="views" />
		<Require feature="locked-domain" />
	</ModulePrefs>
	<Content type="html"><![CDATA[

		{$page}

]]>
</Content>
</Module>
XML;




header('Content-Type: text/xml');
die($xml);
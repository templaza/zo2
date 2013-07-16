<?php
/**
 * Zo2 Framework (http://zo2framework.org)
 *
 * @link         http://github.com/aploss/zo2
 * @package      Zo2
 * @author       Duc Nguyen <ducntq@gmail.com>
 * @author       Vu Hiep
 * @copyright    Copyright ( c ) 2008 - 2013 APL Solutions
 * @license      http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or Later
 */


class Zo2Layout {
    /* private */
    private $_layoutName, $_layoutContent, $_layoutPath, $_templateName, $_staticsPath, $_coreStaticsPath, $_templateUri = '';
    private $_output = '';
    private $_layoutStatics = array();

    /**
     * Construct a Zo2Layout object
     *
     * @param $templateName
     * @param $layoutName
     */
    public function __construct($templateName, $layoutName){
        // assign values to private variables
        $layoutDir = JPATH_SITE . '/templates/' . $templateName . '/layouts/';
        $this->_layoutPath = $layoutDir . $layoutName . '.compiled.php';
        $this->_staticsPath = $layoutDir . $layoutName . '.json';
        $this->_coreStaticsPath = $layoutDir . 'core.json';
        $this->_templateName = $templateName;
        $this->_layoutName = $layoutName;
        $this->_templateUri = JUri::root() . 'templates/' . $templateName;

        // check layout existence, if layout not existed, get default layout, which is homepage.php
        if(!file_exists($this->_layoutPath) || !file_exists($this->_staticsPath)) {
            $this->_layoutPath = JPATH_SITE . '/templates/' . $templateName . '/layouts/homepage.compiled.php';
            $this->_staticsPath = JPATH_SITE . '/templates/' . $templateName . '/layouts/homepage.json';
        }

        // get template content
        $this->_layoutStatics = array('header' => array(), 'footer' => array());
        $this->_layoutContent = file_get_contents($this->_layoutPath);
        $coreStaticsJson = file_get_contents($this->_coreStaticsPath);
        $staticsJson = file_get_contents($this->_staticsPath);
        $coreStatics = json_decode($coreStaticsJson, true);
        $statics = json_decode($staticsJson, true);

        // combine layout statics
        $this->_layoutStatics['header'] = array_merge($coreStatics['header'], $statics['header']);
        $this->_layoutStatics['footer'] = array_merge($coreStatics['footer'], $statics['footer']);
    }

    /**
     * Get current layout content
     *
     * @return string
     */
    public function getLayoutContent(){
        return $this->_layoutContent;
    }

    /**
     * Insert javascript and css into document
     *
     * @return string
     */
    private function insertStatics(){
        $footer = "";
        $header = "";
        if($this->_layoutStatics != null){
            foreach($this->_layoutStatics['header'] as $item){
                if($item['type'] == 'css') $header .= $this->generateCssTag($item);
                elseif($item['type'] == 'js') $header .= $this->generateJsTag($item);
            }
            foreach($this->_layoutStatics['footer'] as $item){
                if($item['type'] == 'css') $footer .= $this->generateCssTag($item);
                elseif($item['type'] == 'js') $footer .= $this->generateJsTag($item);
            }
        }

        if(!empty($header)){
            $this->_output = str_replace('</head>', $header . '</head>' , $this->_output);
        }

        if(!empty($header)){
            $this->_output = str_replace('</body>', $footer . '</body>' , $this->_output);
        }
        return $this->_output;
    }


    /**
     * Insert script tag for js
     *
     * @param $item
     * @return string
     */
    private function generateJsTag($item){
        $async = "";
        if(isset($item['options']['async'])) $async = " async=\"" . $item['options']['async'] . "\"";
        return "<script" . $async . " type=\"text/javascript\" src=\"" . $this->_templateUri . $item['path'] . "\"></script>\n";
    }

    /**
     * Insert link tag for css
     *
     * @param $item
     * @return string
     */
    private function generateCssTag($item){
        $rel = isset($item['options']['rel']) ? $item['options']['rel'] : "stylesheet";
        return "<link rel=\"" . $rel . "\" href=\"" . $this->_templateUri . $item['path'] . "\" type=\"text/css\" />\n";
    }

    /**
     * Compile layout into Html Template
     *
     * @param bool $removeJdoc
     * @param bool $layoutBuilder Add necessary CSS for layoutbuilder
     * @return string
     */
    public function compile($removeJdoc = false, $layoutBuilder = false) {
        $this->_output = $this->_layoutContent;
        $this->insertStatics();
        if($removeJdoc) {
            $this->_output = preg_replace('#<jdoc:include\ type="([^"]+)" (.*)\/>#iU', '', $this->_output);
        }
        if ($layoutBuilder) $this->insertLayoutBuilderCss();
        else{
            $this->_output = preg_replace('#<head>#', '<head><jdoc:include type="head" />', $this->_output);
            $this->_output = $this->parseDataComponent($this->_output);
        }
        return self::compressHtml($this->_output);
    }

    private function insertLayoutBuilderCss() {
        $pluginPath = Zo2Framework::getSystemPluginPath();
        $layoutBuilderPath = $pluginPath . '/css/layoutbuilder.css';
        $jQueryUICssPath = $pluginPath . '/css/layoutbuilder.css';
        $cssFormat = '<link rel="stylesheet" id="%s" type="text/css" href="%s" />';
        $result = sprintf($cssFormat, 'cssLayoutBuilder', $layoutBuilderPath);
        $result .= sprintf($cssFormat, 'cssJqueryUI', $jQueryUICssPath);
        $result .= '</head>';
        $this->_output = str_replace('</head>', $result, $this->_output);
    }

    public function parseDataComponent($input)
    {
        $pattern = '#<div[^>]+data-zo2componenttype="data-component"[^>]+></div>#';

        return preg_replace_callback($pattern, 'Zo2Layout::embedDataComponent', $input);
    }

    public static function embedDataComponent($matches)
    {
        if($matches[0]) {
            $html = $matches[0];
            $attrPattern = '#data-zo2[a-zA-Z0-9-]+=["\']?[a-zA-Z0-9-_]+["\']?#';

            preg_match_all($attrPattern, $html, $attrMatches);

            // extract attribute
            $attributes = array();
            if($attrMatches[0]) {
                foreach($attrMatches[0] as $attr) {
                    $attr = str_replace('data-zo2', '', $attr);
                    $limiterPos = strpos($attr, '=');
                    $key = substr($attr, 0, $limiterPos);
                    $value = substr($attr, $limiterPos + 2, strlen($attr) - $limiterPos - 3);
                    $attributes[$key] = $value;
                }
            }

            if(count($attributes) > 0 && isset($attributes['componentid'])) {
                $componentName = $attributes['componentid'];

                // exclusively render megamenu
                if ($componentName == 'megamenu') {
                    $doc = JFactory::getDocument();
                    $zo2 = Zo2Framework::getInstance();
                    return $zo2->displayMegaMenu($zo2->getParams('menutype', 'mainmenu'), $zo2->getTemplate());
                }

                $classname = 'zo2widget_' . $componentName;

                if (!class_exists($classname, false)){
                    // as good as include from frontend, may not work on backend
                    $componentPath = Zo2Framework::getCurrentTemplateAbsolutePath() . '/components/' . $componentName . '.php';
                    if (file_exists($componentPath)) require_once($componentPath);
                    else return '';
                }

                $component = new $classname();

                if ($component instanceof Zo2Widget) {
                    $component->loadAttributes($attributes);
                    return $component->render();
                }
            }
        }

        return '';
    }

    public static function compressHtml($input) {
        $input = str_replace("\n\n", "\n", $input);
        $input = str_replace("\r\r", "\r", $input);
        return $input;
    }

    public function combineJS() {
        if(!class_exists('PhpClosure', false)) {
            Zo2Framework::import('core.class.minify.closure');
        }


    }
}
<?php
/**
 * Zo2 (http://www.zo2framework.org)
 * A powerful Joomla template framework
 *
 * @link        http://www.zo2framework.org
 * @link        http://github.com/aploss/zo2
 * @author      Duc Nguyen <ducntv@gmail.com>
 * @author      Hiepvu <vqhiep2010@gmail.com>
 * @copyright   Copyright (c) 2013 APL Solutions (http://apl.vn)
 * @license     GPL v2
 */
//no direct accees
defined('_JEXEC') or die ('resticted aceess');

/**
 * Base class for a Short code
 * @package     zo2
 * @subpackage  Zo2ShortCode
 */
class Zo2Shortcode extends JObject
{
    /**
     * The  short code tag
     * @var string
     */
    protected $tagname = '';
    /**
     * The ShortCode attributes
     * @var array
     */
    protected $attrs = array();
    /**
     * @var string
     */
    protected $content = "";

    /**
     * Construct
     */
    public function __construct() {
        $this->ShortCode = Zo2Framework::getInstance()->ShortCode;
    }

    /**
     * Running short code
     */
    public function run()
    {
        if ($this->tagname) {
            $this->ShortCode->add_shortcode($this->tagname, array(&$this, 'content'));
        }
    }
    public function shortcode_atts($default = array(), $config = array()) {
        return $this->ShortCode->shortcode_atts($default, $config);
    }
    /**
     * The content of a short code, it is empty content. So this method must be overwritten by a child method
     */
    protected function body(){}

    /**
     * Attempts to convert a ShortCode tag into embed HTML
     * @param array $attrs ShortCode attributes
     * @param string $content the url attempting to be embedded.
     * @return string the embed HTML on success
     */
    public function content($attrs, $content = "")
    {
        $this->attrs = $attrs;
        $this->content = $content;

        if (!is_array($this->attrs)) {
            return '<!-- '.$this->tagname.' tag passed invalid attributes -->';
        }

        return '<div class="embed-container">' . $this->body() . '</div>';
    }

}

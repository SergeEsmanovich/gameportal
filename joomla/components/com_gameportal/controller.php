<?php

/**
 * @package     Joomla.Site
 * @subpackage  com_wrapper
 *
 * @copyright   Copyright (C) 2005 - 2015 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

/**
 * Content Component Controller
 *
 * @since  1.5
 */
class GameportalController extends JControllerLegacy {

    /**
     * Method to display a view.
     *
     * @param   boolean  $cachable   If true, the view output will be cached
     * @param   array    $urlparams  An array of safe url parameters and their variable types, for valid values see {@link JFilterInput::clean()}.
     *
     * @return  JControllerLegacy  This object to support chaining.
     *
     * @since   1.5
     */
    public function display($cachable = false, $urlparams = array()) {
        $cachable = true;

        // Set the default view name and format from the Request.
        $vName = $this->input->get('view', 'gameportal');
        $this->input->set('view', $vName);

        return parent::display($cachable, array('Itemid' => 'INT'));
    }

    public function getmaterial() {
        header('Access-Control-Allow-Origin: *');
        $alias = JRequest::getVar('alias');
        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $filds = array(
            'id', 'title', 'introtext', 'images', 'catid', 'alias', 'fulltext'
        );
        $query->select($db->quoteName($filds));
        $query->from($db->quoteName('#__content'));
        $query->where("alias = '$alias'");
        $db->setQuery($query);
        $result = $db->loadObject();
        $images = json_decode($result->images);
        $result->images = $images->image_intro;
        $result->introtext = strip_tags($result->introtext);
        $result->catid = (int) $result->catid;
        echo json_encode($result);
    }

    public function getcontent() {
        header('Access-Control-Allow-Origin: *');

        $page = JRequest::getVar('page');


        $db = JFactory::getDbo();
        $query = $db->getQuery(true);

        $filds = array(
            'id', 'title', 'introtext', 'images', 'catid', 'alias', 'fulltext', 'created'
        );
        $where = $db->quoteName('state') . ' = ' . $db->quote(1);

//        if (!empty($catid)) {
//            $catid = explode(';', $catid);
//            $str = '(';
//            foreach ($catid as $key => $value) {
//                if($value)
//                $str = $str . $value . ',';
//            }
//            $str = $str . '0)';
//            $where = $where . ' AND ' . $db->quoteName('catid') . ' IN ' . $str;
//        }

        $query->select($db->quoteName($filds));
        $query->from($db->quoteName('#__content'));



        $query->where($where);
//                ->order('ordering ASC');


        $page_start = $page * 20;
        $page_length = 20;

        $db->setQuery($query, $page_start, $page_length);
        $results = $db->loadObjectList();

//        echo '<pre>';
//        print_r($results);
//        echo '</pre>';
//        $conteiner = array();
        foreach ($results as $key => $value) {
            $images = json_decode($value->images);
            $value->images = $images->image_intro;
            $value->introtext = strip_tags($value->introtext);
            $value->catid = (int) $value->catid;
            $value->created = JHTML::_('date', $value->created, JText::_('DATE_FORMAT_LC3'));

//            if ($key % 7 != 0) {
//                $arr_small[] = $value;
//                if ((count($arr_small) == 2) || ($key + 1 == count($results))) {
//                    $conteiner [] = array('block' => $arr_small);
//                    unset($arr_small);
//                }
//            } else {
//                $arr_big[] = $value;
//                $conteiner [] = array('block' => $arr_big);
//                unset($arr_big);
//            }
        }


        echo json_encode($results);
    }
    public function get_other(){
        $currentCategory = JRequest::getVar('currentCategory');
        $currentCategory = json_decode($currentCategory);

        $noteId = JRequest::getVar('noteId');
        $noteId = json_decode($noteId);

        $db = JFactory::getDbo();
        $query = $db->getQuery(true);

        $filds = array(
            'id', 'title', 'introtext', 'images', 'catid', 'alias', 'fulltext', 'created'
        );

        $conditions = array( 
            $db->quoteName('state') . ' = '  . $db->quote(1),  
            $db->quoteName('catid') . ' = '  . $db->quote($currentCategory),
            $db->quoteName('id')    . ' != ' . $db->quote($noteId)
        ); 

        $query->select($db->quoteName($filds));
        $query->from($db->quoteName('#__content'));

        $query->where($conditions, 'AND');

        $db->setQuery($query, 0, 4);
        $results = $db->loadObjectList();

        foreach ($results as $key => $value) {
            $images = json_decode($value->images);
            $value->images = $images->image_intro;
            $value->introtext = strip_tags($value->introtext);
            $value->catid = (int) $value->catid;
            $value->created = JHTML::_('date', $value->created, JText::_('DATE_FORMAT_LC3'));
        }

        echo json_encode($results);
    }
    public function get_comments(){
        $noteId = JRequest::getVar('noteId');
        $noteId = json_decode($noteId);

        $db = JFactory::getDbo();
        $query = $db->getQuery(true);

        $filds = array(
            'id', 'thread_id', 'username', 'comment', 'date', 'published'
        );

        $conditions = array( 
            $db->quoteName('thread_id') . ' = ' . $db->quote($noteId),
            $db->quoteName('published') . ' = ' . $db->quote(1)
        ); 

        $query->select($db->quoteName($filds));
        $query->from($db->quoteName('#__jcomments'));

        $query->where($conditions, 'AND');
        $query->order('id DESC');

        $db->setQuery($query, 0, 5);
        $results = $db->loadObjectList();

        foreach ($results as $key => $value) {
            $value->thread_id = (int) $value->thread_id;
            $value->comment = strip_tags($value->comment);
            $date = new DateTime($value->date);
            $value->date =  $date->format('d.m.Y | H:i');
        }

        echo json_encode($results);
    }
    public function add_comment() {
        $comment = JRequest::getVar('comment');
        $comment = json_decode($comment);

        $date = JHtml::date('now -1 hour' , 'Y-m-d H:i:s', true);
        $comment->date = $date; 

        $result = JFactory::getDbo()->insertObject('#__jcomments', $comment);

        echo json_encode($comment);
    }

}
